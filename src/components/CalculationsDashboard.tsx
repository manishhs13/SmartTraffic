/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JunctionData, CalculationsResult, DirectionCounts } from '../types';
import { runJunctionAnalysis } from '../utils/trafficCalculations';
import { Sliders, HelpCircle, Activity, Layout, Layers, Clock, TrendingUp, Info } from 'lucide-react';

interface CalculationsDashboardProps {
  junction: JunctionData;
  counts: DirectionCounts;
  results: CalculationsResult;
  onConfigChange: (startLost: number, allRed: number) => void;
  startLostPerPhase: number;
  allRedTime: number;
  onNext: () => void;
}

export function CalculationsDashboard({
  junction,
  counts,
  results,
  onConfigChange,
  startLostPerPhase,
  allRedTime,
  onNext
}: CalculationsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'saturation' | 'flow_ratio' | 'lost_cycle' | 'green_splits' | 'efficiency'>('saturation');

  const directions = [
    { key: 'nb' as const, label: 'North Bound (NB)' },
    { key: 'sb' as const, label: 'South Bound (SB)' },
    { key: 'eb' as const, label: 'East Bound (EB)' },
    { key: 'wb' as const, label: 'West Bound (WB)' },
  ];

  return (
    <div id="calculations-dashboard-wrapper" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Engineering Equations Ledger</h2>
          <p className="text-xs text-slate-400">Calculations based on standard Highway Engineering & IRC methods</p>
        </div>
      </div>

      {/* Calculations Sub-Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          id="btn-calc-tab-saturation"
          onClick={() => setActiveTab('saturation')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'saturation'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Saturation Flow
        </button>
        <button
          id="btn-calc-tab-flow"
          onClick={() => setActiveTab('flow_ratio')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'flow_ratio'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Flow Ratio
        </button>
        <button
          id="btn-calc-tab-cycle"
          onClick={() => setActiveTab('lost_cycle')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'lost_cycle'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Cycle & Lost
        </button>
        <button
          id="btn-calc-tab-green"
          onClick={() => setActiveTab('green_splits')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'green_splits'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Green Splits
        </button>
        <button
          id="btn-calc-tab-eff"
          onClick={() => setActiveTab('efficiency')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'efficiency'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          5. LOS & Delay
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg shadow-slate-950/20">
        {activeTab === 'saturation' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Screen 6: Saturation Flow Rate Calculation (S)
              </h3>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div>
                <p className="font-bold text-slate-850 dark:text-slate-300 mb-1">Standard Method:</p>
                Saturation flow represents the maximum theoretical rate of traffic flow past the stopline when given continuous green. It is defined as:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>For road width <span className="font-bold">W &gt; 5.5 meters</span>:<br />
                    <span className="font-bold text-amber-600 dark:text-amber-400">S = 525 × W</span> (PCU/hr)
                  </li>
                  <li>For road width <span className="font-bold">W &le; 5.5 meters</span>:<br />
                    Utilize standard road-width lookup table and apply <span className="font-bold">linear interpolation</span>:
                  </li>
                </ul>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                <p className="font-bold text-slate-850 dark:text-slate-300 mb-1">Lookup Standards Table (PCUs/hr):</p>
                <div className="grid grid-cols-3 gap-2 text-[10px] bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                  <span className="font-semibold">Width: 3.0m</span> <span className="font-semibold">S: 1850</span> <span className="text-slate-400">PCU/hr</span>
                  <span className="font-semibold">Width: 3.5m</span> <span className="font-semibold">S: 1890</span> <span className="text-slate-400">PCU/hr</span>
                  <span className="font-semibold">Width: 4.0m</span> <span className="font-semibold">S: 1950</span> <span className="text-slate-400">PCU/hr</span>
                  <span className="font-semibold">Width: 4.5m</span> <span className="font-semibold">S: 2250</span> <span className="text-slate-400">PCU/hr</span>
                  <span className="font-semibold">Width: 5.0m</span> <span className="font-semibold">S: 2550</span> <span className="text-slate-400">PCU/hr</span>
                  <span className="font-semibold">Width: 5.5m</span> <span className="font-semibold">S: 2990</span> <span className="text-slate-400">PCU/hr</span>
                </div>
              </div>
            </div>

            {/* Substitution Results */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Computed Saturation Flows for Current Geometry
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {directions.map((d) => {
                  const width = junction[d.key].roadWidth;
                  const flow = results.saturationFlow[d.key];
                  const hasFormula = width > 5.5;

                  return (
                    <div key={d.key} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">{d.label}</span>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                        {flow} <span className="text-xs font-semibold text-slate-400">PCU/hr</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2">
                        Width: <span className="font-semibold">{width}m</span> ({junction[d.key].lanes} lanes)
                      </div>
                      <div className="text-[9px] font-semibold text-amber-500 uppercase mt-0.5">
                        {hasFormula 
                          ? `Formula: 525 × ${width}` 
                          : `Lookup Interpolated`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flow_ratio' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendUpIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Screen 7: Flow Ratio Calculations ($y_i = q_i / S_i$)
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              The flow ratio (<span className="font-bold">y</span>) for each approach is the ratio of design hourly flow to the approach's saturation flow:
              <br />
              <span className="font-bold text-amber-600 dark:text-amber-400 block my-2 text-center text-sm">
                y_i = q_i / S_i
              </span>
              Where <span className="font-bold">q_i</span> is the directional hourly PCU volume, and <span className="font-bold">S_i</span> is the saturation flow.
              For a standard 2-phase system:<br />
              • <span className="font-bold">Phase 1 (North-South) Max Ratio</span>: y1 = max(y_NB, y_SB)<br />
              • <span className="font-bold">Phase 2 (East-West) Max Ratio</span>: y2 = max(y_EB, y_WB)<br />
              • <span className="font-bold">Sum Flow Ratio</span>: Sum(yi) = y1 + y2
            </p>

            {/* Substitution Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {directions.map((d) => {
                  const q = results.pcuHourly[d.key];
                  const s = results.saturationFlow[d.key];
                  const y = results.flowRatio[d.key];
                  return (
                    <div key={d.key} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">{d.label}</span>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                        {y.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-slate-550 mt-1">
                        q = <span className="font-bold text-slate-700 dark:text-slate-350">{q} PCU/hr</span>
                      </div>
                      <div className="text-[10px] text-slate-550">
                        S = <span className="font-bold text-slate-700 dark:text-slate-350">{s} PCU/hr</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-2 font-mono">
                        {q} / {s}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phase Ratios summarize */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
                    Flow Ratios Summary
                  </span>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span>
                      Phase 1 (NB/SB) Peak <span className="font-bold text-amber-600">y1 = {results.flowRatio.phase1Max.toFixed(4)}</span>
                    </span>
                    <span>
                      Phase 2 (EB/WB) Peak <span className="font-bold text-amber-600">y2 = {results.flowRatio.phase2Max.toFixed(4)}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Junction Ratio (Sum yi)</span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {results.flowRatio.sumY.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lost_cycle' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Screen 8 & 9: Webster Lost & Optimal Cycle Times
              </h3>
            </div>

            {/* Custom Interactive Sliders to update Calculations instantly */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 gap-6 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Starter Latency per Phase (l)
                  </label>
                  <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {startLostPerPhase.toFixed(1)} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={startLostPerPhase}
                  onChange={(e) => onConfigChange(parseFloat(e.target.value), allRedTime)}
                  className="w-full accent-amber-500"
                />
                <span className="text-[9px] text-slate-450 block">Typical startup delay when signal switches from red to green (default: 2.0s).</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    All-Red Safety Delay (R)
                  </label>
                  <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {allRedTime.toFixed(1)} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={allRedTime}
                  onChange={(e) => onConfigChange(startLostPerPhase, parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="text-[9px] text-slate-450 block">All-red phase clears the junction square of fast moving vehicles (default: 2.0s).</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Lost Time (L)</span>
                <p className="text-xs text-slate-500 mt-1">
                  Formula: <span className="font-semibold text-amber-600">L = n × l + R</span>
                </p>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {results.lostTime.totalLostTime} <span className="text-sm text-slate-400">seconds</span>
                </div>
                <div className="text-[10px] text-slate-450 mt-1.5 break-all">
                  Substitution: 2(phases) × {results.lostTime.perPhaseLost}s + {results.lostTime.allRedTime}s
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[10px] font-bold uppercase text-slate-400">Optimal Cycle Time (C0)</span>
                <p className="text-xs text-slate-500 mt-1">
                  Webster Formula: <span className="font-semibold text-amber-600">C0 = (1.5L + 5) / (1 - Sum(yi))</span>
                </p>
                <div className="text-3xl font-black text-amber-550 mt-2">
                  {results.cycleTime.optimalCycleTime} <span className="text-sm text-slate-400">seconds</span>
                </div>
                <div className="text-[10px] text-slate-450 mt-1.5 break-all">
                  Substitution: (1.5×{results.lostTime.totalLostTime} + 5) / (1 - {results.flowRatio.sumY.toFixed(4)})
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'green_splits' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Screen 10, 11 & 12: Split Ratios and Real Signal Timings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[10px] font-bold uppercase text-slate-400">Effective Green Hour (G)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formula: <span className="font-bold text-amber-600">G = C0 - L</span>
                </p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {results.effectiveGreen.totalEffectiveGreen} <span className="text-xs text-slate-400">seconds total</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1.5">
                  Calculation: {results.cycleTime.optimalCycleTime}s (Cycle) - {results.lostTime.totalLostTime}s (Loss)
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[10px] font-bold uppercase text-slate-400">Green Splits Distribution</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formula: <span className="font-bold text-amber-600">gi = (yi / Sum(yi)) × G</span>
                </p>
                <div className="text-xs space-y-1 mt-2.5">
                  <div className="flex justify-between font-semibold">
                    <span>Phase 1 (NB + SB Green):</span>
                    <span className="text-amber-600 dark:text-amber-400">{results.greenSplit.nb_sb_seconds}s</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Phase 2 (EB + WB Green):</span>
                    <span className="text-amber-600 dark:text-amber-400">{results.greenSplit.eb_wb_seconds}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signal Timing Summary Sheet */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-2.5">
                Calculated Approach Timings (Amber Fixed at 2 seconds)
              </h4>
              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 font-semibold uppercase text-slate-500 h-10">
                      <th className="py-2.5 px-4 font-bold text-[10px]">Approach Direction</th>
                      <th className="py-2.5 px-4 font-bold text-[10px] text-center">Green Phase (g)</th>
                      <th className="py-2.5 px-4 font-bold text-[10px] text-center">Amber Clearance (a)</th>
                      <th className="py-2.5 px-4 font-bold text-[10px] text-center">Red Stop-phase (r)</th>
                      <th className="py-2.5 px-4 font-bold text-[10px] text-right">Sum Cycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850/60 font-medium">
                    {directions.map((d) => {
                      const timings = results.signalTiming[d.key];
                      return (
                        <tr key={d.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{d.label}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold dark:text-emerald-400">
                              {timings.green}s
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold dark:text-amber-400">
                              {timings.amber}s
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-bold dark:text-red-400">
                              {timings.red}s
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-400">
                            {timings.green + timings.amber + timings.red}s
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Screen 17: Signal Performance & Delay Evaluation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[10px] font-bold uppercase text-slate-400">System Design Efficiency</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Efficiency percentage based on active green split capacity:
                  <br />
                  <span className="font-bold text-amber-600">Efficiency = (EffectiveGreen / CycleTime) × 100</span>
                </p>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                  {results.performance.efficiency.toFixed(1)}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${results.performance.efficiency}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Estimated Control Delay</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Calculated average control delay using the HCM delay formula:
                  </p>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                    {results.los.delay.toFixed(1)} <span className="text-xs font-semibold text-slate-450">sec / vehicle</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${results.los.heatColor === 'green' ? 'bg-emerald-500' : results.los.heatColor === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    LOS {results.los.grade} ({results.los.condition})
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Parameters Summary Card */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-2xl p-4 bg-white dark:bg-slate-950 space-y-3">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-500" />
                Signal Performance Module Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 uppercase text-[9px] font-bold">Webster Cycle Time</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{results.cycleTime.optimalCycleTime} sec</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[9px] font-bold">Total Lost Time</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{results.lostTime.totalLostTime} sec</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[9px] font-bold">Effective Green Split</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{results.effectiveGreen.totalEffectiveGreen} sec</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[9px] font-bold">Operational Efficiency</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{results.performance.efficiency.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-simulator-tab"
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Launch Phase Simulator
          <Clock className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

// Inline fallback icon for trend up to prevent build issues
function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}
