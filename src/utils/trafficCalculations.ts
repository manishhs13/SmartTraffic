/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JunctionData, DirectionCounts, CalculationsResult } from '../types';
import { VECHICLE_TYPES } from '../data/pcuValues';

// Saturation flow lookup table for road widths <= 5.5
const SATURATION_LOOKUP: { width: number; flow: number }[] = [
  { width: 3.0, flow: 1850 },
  { width: 3.5, flow: 1890 },
  { width: 4.0, flow: 1950 },
  { width: 4.5, flow: 2250 },
  { width: 5.0, flow: 2550 },
  { width: 5.5, flow: 2990 },
];

/**
 * Calculates Saturation Flow (S) based on road width
 */
export function calculateSaturationFlow(width: number): number {
  if (width <= 0) return 0;
  
  if (width > 5.5) {
    // S = 525 * Width for width > 5.5
    return Math.round(525 * width);
  }

  // Lookup and interpolate for width <= 5.5
  // Exact match
  const exactMatch = SATURATION_LOOKUP.find(item => Math.abs(item.width - width) < 0.01);
  if (exactMatch) {
    return exactMatch.flow;
  }

  // Under minimum
  if (width < SATURATION_LOOKUP[0].width) {
    // Extrapolate down or clamp
    const item1 = SATURATION_LOOKUP[0];
    const item2 = SATURATION_LOOKUP[1];
    const slope = (item2.flow - item1.flow) / (item2.width - item1.width);
    const flow = item1.flow + slope * (width - item1.width);
    return Math.max(1000, Math.round(flow)); // Bound min
  }

  // In between lookup table values (Interpolate)
  for (let i = 0; i < SATURATION_LOOKUP.length - 1; i++) {
    const x1 = SATURATION_LOOKUP[i].width;
    const y1 = SATURATION_LOOKUP[i].flow;
    const x2 = SATURATION_LOOKUP[i + 1].width;
    const y2 = SATURATION_LOOKUP[i + 1].flow;

    if (width >= x1 && width <= x2) {
      // Y = Y1 + ((Y2 - Y1) * (X - X1) / (X2 - X1))
      const flow = y1 + ((y2 - y1) * (width - x1)) / (x2 - x1);
      return Math.round(flow);
    }
  }

  return 2990; // Fallback bound
}

/**
 * Perform complete traffic engineering and signal cycle calculations
 */
export function runJunctionAnalysis(
  junction: JunctionData,
  counts: DirectionCounts,
  lostTimeConfigs?: { startLostPerPhase?: number; allRedTime?: number }
): CalculationsResult {
  const startLost = lostTimeConfigs?.startLostPerPhase ?? 2.0; // l
  const allRed = lostTimeConfigs?.allRedTime ?? 2.0; // R
  const numPhases = 2; // Fixed 2-phase layout (Phase 1: NB+SB, Phase 2: EB+WB)

  // 1. Calculate PCU Values
  const vehicleWiseCounts: { [id: string]: { count: number; pcu: number } } = {};
  VECHICLE_TYPES.forEach(v => {
    vehicleWiseCounts[v.id] = { count: 0, pcu: 0 };
  });

  const directions: ('nb' | 'sb' | 'eb' | 'wb')[] = ['nb', 'sb', 'eb', 'wb'];
  const pcuTotals = { nb: 0, sb: 0, eb: 0, wb: 0 };

  directions.forEach(dir => {
    const dirCounts = counts[dir];
    let sumPcu = 0;
    VECHICLE_TYPES.forEach(v => {
      const count = dirCounts[v.id] || 0;
      const pcu = count * v.pcuValue;
      sumPcu += pcu;

      vehicleWiseCounts[v.id].count += count;
      vehicleWiseCounts[v.id].pcu += pcu;
    });
    pcuTotals[dir] = Math.round(sumPcu);
  });

  const grandTotalPcu = pcuTotals.nb + pcuTotals.sb + pcuTotals.eb + pcuTotals.wb;

  // 2. Saturation Flow
  const satFlow = {
    nb: calculateSaturationFlow(junction.nb.roadWidth),
    sb: calculateSaturationFlow(junction.sb.roadWidth),
    eb: calculateSaturationFlow(junction.eb.roadWidth),
    wb: calculateSaturationFlow(junction.wb.roadWidth),
  };

  // 3. Flow Ratios (yi = qi / Si)
  const flowRatio = {
    nb: satFlow.nb > 0 ? pcuTotals.nb / satFlow.nb : 0,
    sb: satFlow.sb > 0 ? pcuTotals.sb / satFlow.sb : 0,
    eb: satFlow.eb > 0 ? pcuTotals.eb / satFlow.eb : 0,
    wb: satFlow.wb > 0 ? pcuTotals.wb / satFlow.wb : 0,
  };

  // Phase 1 (NB + SB) critical ratio: Max(NB, SB)
  const phase1Max = Math.max(flowRatio.nb, flowRatio.sb);
  // Phase 2 (EB + WB) critical ratio: Max(EB, WB)
  const phase2Max = Math.max(flowRatio.eb, flowRatio.wb);

  // Sum split ratio
  let sumY = phase1Max + phase2Max;
  // Safety constraint: prevent dividing by zero or negative in Websters formula
  if (sumY >= 0.95) {
    sumY = 0.95; // Limit to prevent division error / infinite cycle times
  }

  // 4. Lost Time (L = n*l + R)
  const totalLostTime = numPhases * startLost + allRed;

  // 5. Optimal Cycle Time (C0 = (1.5L + 5) / (1 - sumY))
  let rawC0 = (1.5 * totalLostTime + 5) / (1 - sumY);
  let optimalCycleTime = Math.round(rawC0);

  // Reasonable signal bounds
  if (optimalCycleTime < 40) optimalCycleTime = 40;
  if (optimalCycleTime > 150) optimalCycleTime = 150;

  // 6. Effective Green Time (G = C0 - L)
  const totalEffectiveGreen = optimalCycleTime - totalLostTime;

  // 7. Green Splits: gi = (yi / sumY) * G
  let p1Split = sumY > 0 ? (phase1Max / sumY) * totalEffectiveGreen : totalEffectiveGreen / 2;
  let p2Split = sumY > 0 ? (phase2Max / sumY) * totalEffectiveGreen : totalEffectiveGreen / 2;

  // Round green splits to valid integers
  let nb_sb_seconds = Math.round(p1Split);
  let eb_wb_seconds = Math.round(p2Split);

  // Ensure sum equals exact available green
  const diff = totalEffectiveGreen - (nb_sb_seconds + eb_wb_seconds);
  if (diff !== 0) {
    nb_sb_seconds += diff; // Distribute rounding error to Phase 1
  }

  // Enforce small minimum greens for human safety (e.g. 7 secs)
  if (nb_sb_seconds < 7) {
    const shift = 7 - nb_sb_seconds;
    nb_sb_seconds = 7;
    eb_wb_seconds = Math.max(7, eb_wb_seconds - shift);
  }
  if (eb_wb_seconds < 7) {
    const shift = 7 - eb_wb_seconds;
    eb_wb_seconds = 7;
    nb_sb_seconds = Math.max(7, nb_sb_seconds - shift);
  }

  // Re-adjust optimalCycleTime to sum perfectly
  optimalCycleTime = nb_sb_seconds + eb_wb_seconds + totalLostTime;

  // 8. Individual signal timings (Amber fixed at 2s)
  const AMBER = 2; // Fixed amber time in seconds

  const signalTiming = {
    nb: {
      green: nb_sb_seconds,
      amber: AMBER,
      red: optimalCycleTime - nb_sb_seconds - AMBER,
    },
    sb: {
      green: nb_sb_seconds,
      amber: AMBER,
      red: optimalCycleTime - nb_sb_seconds - AMBER,
    },
    eb: {
      green: eb_wb_seconds,
      amber: AMBER,
      red: optimalCycleTime - eb_wb_seconds - AMBER,
    },
    wb: {
      green: eb_wb_seconds,
      amber: AMBER,
      red: optimalCycleTime - eb_wb_seconds - AMBER,
    },
  };

  // 9. Efficiency = (EffectiveGreen / CycleTime) * 100
  const efficiency = optimalCycleTime > 0 ? (totalEffectiveGreen / optimalCycleTime) * 100 : 0;

  // 10. Level of Service (LOS) calculation based on average delay
  // Average delay: d = 0.5 * C * (1 - lambda)^2 / (1 - lambda * X)
  // Let's compute average delay based on the worst-performing direction
  let worstDelay = 0;
  directions.forEach(dir => {
    const q = pcuTotals[dir];
    const s = satFlow[dir];
    const g = dir === 'nb' || dir === 'sb' ? nb_sb_seconds : eb_wb_seconds;
    
    if (q > 0 && s > 0) {
      const lambda = g / optimalCycleTime;
      const capacity = s * lambda;
      const x = q / capacity;
      
      const term1 = (0.5 * optimalCycleTime * Math.pow(1 - lambda, 2)) / (1 - Math.min(0.99, lambda * x));
      // Add random delay component for highly loaded approaches
      const term2 = x > 0.5 ? 900 * 0.25 * (Math.pow(x - 1, 2) + Math.sqrt(Math.pow(x - 1, 2) + (x / capacity))) : 0;
      const delay = Math.max(2, term1 + term2);
      if (delay > worstDelay) worstDelay = delay;
    }
  });

  // If no traffic, baseline delay is small
  if (worstDelay === 0) worstDelay = 4.5;

  let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'A';
  let condition = 'Free Flow (Excellent)';
  let heatColor: 'green' | 'yellow' | 'red' = 'green';

  if (worstDelay <= 10) {
    grade = 'A';
    condition = 'Very Low Delay (Optimal Flow)';
    heatColor = 'green';
  } else if (worstDelay <= 20) {
    grade = 'B';
    condition = 'Stable Flow (Good Control)';
    heatColor = 'green';
  } else if (worstDelay <= 35) {
    grade = 'C';
    condition = 'Fair Flow (Noticeable Queueing)';
    heatColor = 'yellow';
  } else if (worstDelay <= 55) {
    grade = 'D';
    condition = 'Approaching Saturation (Heavy Volume)';
    heatColor = 'yellow';
  } else if (worstDelay <= 80) {
    grade = 'E';
    condition = 'Unstable Flow (Close to Capacity)';
    heatColor = 'red';
  } else {
    grade = 'F';
    condition = 'Complete Congestion (Oversaturated)';
    heatColor = 'red';
  }

  return {
    pcuHourly: {
      nb: pcuTotals.nb,
      sb: pcuTotals.sb,
      eb: pcuTotals.eb,
      wb: pcuTotals.wb,
      total: grandTotalPcu,
      vehicleWise: vehicleWiseCounts,
    },
    saturationFlow: satFlow,
    flowRatio: {
      nb: flowRatio.nb,
      sb: flowRatio.sb,
      eb: flowRatio.eb,
      wb: flowRatio.wb,
      sumY,
      phase1Max,
      phase2Max,
    },
    lostTime: {
      perPhaseLost: startLost,
      allRedTime: allRed,
      totalLostTime,
    },
    cycleTime: {
      optimalCycleTime,
    },
    effectiveGreen: {
      totalEffectiveGreen,
    },
    greenSplit: {
      phase1: p1Split,
      phase2: p2Split,
      nb_sb_seconds,
      eb_wb_seconds,
    },
    signalTiming,
    performance: {
      efficiency,
    },
    los: {
      delay: worstDelay,
      grade,
      condition,
      heatColor,
    },
  };
}
