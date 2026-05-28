/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserSession {
  email: string | null;
  isGuest: boolean;
  isLoggedIn: boolean;
  name?: string;
}

export interface DirectionData {
  roadWidth: number; // in meters
  lanes: number;
}

export interface JunctionMetadata {
  name: string;
  location: string;
  date: string;
  time: string;
  peakHour: string;
}

export interface JunctionData {
  metadata: JunctionMetadata;
  nb: DirectionData;
  sb: DirectionData;
  eb: DirectionData;
  wb: DirectionData;
}

export type DirectionKey = 'nb' | 'sb' | 'eb' | 'wb';

export interface VehicleType {
  id: string;
  name: string;
  pcuValue: number;
  category: 'two_wheeler' | 'three_wheeler' | 'four_wheeler' | 'heavy' | 'other';
}

export interface VehicleCount {
  [vehicleId: string]: number; // count value
}

export interface DirectionCounts {
  nb: VehicleCount;
  sb: VehicleCount;
  eb: VehicleCount;
  wb: VehicleCount;
}

export interface JunctionImage {
  sourceType: 'raw' | 'diagram';
  dataUrl?: string; // Base64 representation of uploaded image
}

export interface CalculationsResult {
  pcuHourly: {
    nb: number;
    sb: number;
    eb: number;
    wb: number;
    total: number;
    vehicleWise: { [vehicleId: string]: { count: number; pcu: number } };
  };
  saturationFlow: {
    nb: number;
    sb: number;
    eb: number;
    wb: number;
  };
  flowRatio: {
    nb: number;
    sb: number;
    eb: number;
    wb: number;
    sumY: number; // Max for Phase 1 (NB/SB) + Max for Phase 2 (EB/WB)
    phase1Max: number;
    phase2Max: number;
  };
  lostTime: {
    perPhaseLost: number; // l
    allRedTime: number; // R
    totalLostTime: number; // L = n * l + R
  };
  cycleTime: {
    optimalCycleTime: number; // C0 = (1.5L + 5) / (1 - sumY)
  };
  effectiveGreen: {
    totalEffectiveGreen: number; // G = C0 - L
  };
  greenSplit: {
    phase1: number; // NB + SB
    phase2: number; // EB + WB
    nb_sb_seconds: number;
    eb_wb_seconds: number;
  };
  signalTiming: {
    nb: { green: number; amber: number; red: number };
    sb: { green: number; amber: number; red: number };
    eb: { green: number; amber: number; red: number };
    wb: { green: number; amber: number; red: number };
  };
  performance: {
    efficiency: number; // (EffectiveGreen / CycleTime) * 100
  };
  los: {
    delay: number; // sec / vehicle average estimate
    grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    condition: string; // "Light Traffic", "Moderate Traffic", "Saturated", etc.
    heatColor: 'green' | 'yellow' | 'red';
  };
}

export interface HistoryRecord {
  id: string;
  userId: string | null;
  savedAt: string;
  junction: JunctionData;
  counts: DirectionCounts;
  image: JunctionImage;
  results: CalculationsResult;
}

export interface EmergencyState {
  isActive: boolean;
  vehicleType: 'Ambulance' | 'Fire Truck' | 'Police Vehicle' | null;
  direction: DirectionKey | null;
}
