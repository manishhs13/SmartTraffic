/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { JunctionData, CalculationsResult, EmergencyState, DirectionKey } from '../types';
import { JunctionDiagramSVG } from './JunctionDiagramSVG';
import { Play, Pause, RotateCcw, AlertTriangle, Radio, ShieldAlert, ArrowRight } from 'lucide-react';

interface LiveSimulationControllerProps {
  junction: JunctionData;
  results: CalculationsResult;
  onNext: () => void;
}

type StepState = 'P1_GREEN' | 'P1_AMBER' | 'P2_GREEN' | 'P2_AMBER';

export function LiveSimulationController({ junction, results, onNext }: LiveSimulationControllerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState<StepState>('P1_GREEN');
  const [timeLeft, setTimeLeft] = useState(results.greenSplit.nb_sb_seconds);
  const [emergency, setEmergency] = useState<EmergencyState>({
    isActive: false,
    vehicleType: null,
    direction: null
  });

  // Keep ref to latest calculations so interval always retrieves fresh split times
  const limitsRef = useRef({
    p1g: results.greenSplit.nb_sb_seconds,
    p2g: results.greenSplit.eb_wb_seconds,
    amber: 2
  });

  useEffect(() => {
    limitsRef.current = {
      p1g: results.greenSplit.nb_sb_seconds,
      p2g: results.greenSplit.eb_wb_seconds,
      amber: 2
    };
  }, [results]);

  // Clock tick interval
  useEffect(() => {
    if (!isPlaying || emergency.isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Trigger State Transition
          let nextStep: StepState = 'P1_GREEN';
          let nextTime = limitsRef.current.p1g;

          if (step === 'P1_GREEN') {
            nextStep = 'P1_AMBER';
            nextTime = limitsRef.current.amber;
          } else if (step === 'P1_AMBER') {
            nextStep = 'P2_GREEN';
            nextTime = limitsRef.current.p2g;
          } else if (step === 'P2_GREEN') {
            nextStep = 'P2_AMBER';
            nextTime = limitsRef.current.amber;
          } else if (step === 'P2_AMBER') {
            nextStep = 'P1_GREEN';
            nextTime = limitsRef.current.p1g;
          }

          setStep(nextStep);
          return nextTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, step, emergency.isActive]);

  const handleReset = () => {
    setStep('P1_GREEN');
    setTimeLeft(results.greenSplit.nb_sb_seconds);
    setIsPlaying(false);
    deactivateEmergency();
  };

  // Resolve active visual signals for the SVG diagram
  const getSimulatedSequence = () => {
    if (emergency.isActive && emergency.direction) {
      const dir = emergency.direction;
      return {
        nb: dir === 'nb' ? 'green' as const : 'red' as const,
        sb: dir === 'sb' ? 'green' as const : 'red' as const,
        eb: dir === 'eb' ? 'green' as const : 'red' as const,
        wb: dir === 'wb' ? 'green' as const : 'red' as const,
      };
    }

    if (step === 'P1_GREEN') {
      return { nb: 'green' as const, sb: 'green' as const, eb: 'red' as const, wb: 'red' as const };
    }
    if (step === 'P1_AMBER') {
      return { nb: 'amber' as const, sb: 'amber' as const, eb: 'red' as const, wb: 'red' as const };
    }
    if (step === 'P2_GREEN') {
      return { nb: 'red' as const, sb: 'red' as const, eb: 'green' as const, wb: 'green' as const };
    }
    // P2_AMBER
    return { nb: 'red' as const, sb: 'red' as const, eb: 'amber' as const, wb: 'amber' as const };
  };

  const activateEmergency = (vehicle: 'Ambulance' | 'Fire Truck' | 'Police Vehicle', dir: DirectionKey) => {
    setEmergency({
      isActive: true,
      vehicleType: vehicle,
      direction: dir
    });
  };

  const deactivateEmergency = () => {
    setEmergency({
      isActive: false,
      vehicleType: null,
      direction: null
    });
    // Re-initialize to start of active phase
    setStep('P1_GREEN');
    setTimeLeft(results.greenSplit.nb_sb_seconds);
  };

  const getPhaseName = () => {
    if (emergency.isActive) {
      return `EMERGENCY EXCLUSION OVERRIDE (${emergency.vehicleType?.toUpperCase()})`;
    }
    if (step === 'P1_GREEN') return 'PHASE 1 (NORTH-SOUTH COHORT) - GREEN VELOCITY';
    if (step === 'P1_AMBER') return 'PHASE 1 CLEARANCE - AMBER STEADY';
    if (step === 'P2_GREEN') return 'PHASE 2 (EAST-WEST COHORT) - GREEN VELOCITY';
    return 'PHASE 2 CLEARANCE - AMBER STEADY';
  };

  return (
    <div id="live-simulator-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Active Signal Phase Simulator</h2>
          <p className="text-xs text-slate-400">Step 4: Synchronized countdowns & emergency transits sandbox simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Drawing Column */}
        <div className="lg:col-span-7 space-y-4">
          <JunctionDiagramSVG
            data={junction}
            imageConfig={{ sourceType: 'diagram' }}
            onImageChange={() => {}}
            activeSequence={getSimulatedSequence()}
            animateTraffic={isPlaying && !emergency.isActive}
          />
        </div>

        {/* Live Controller Dashboard Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main State Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg shadow-slate-950/20 space-y-4 relative overflow-hidden">
            {emergency.isActive && (
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none border border-red-500/20 rounded-3xl" />
            )}

            <div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                emergency.isActive 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {emergency.isActive ? 'Siren Active' : 'Webster Normal Engine'}
              </span>
              <h3 className="text-xs font-bold text-slate-400 mt-2">
                ACTIVE PHASE TIMINGS
              </h3>
              <p className="text-sm font-extrabold text-white leading-tight mt-0.5">
                {getPhaseName()}
              </p>
            </div>

            {/* Countdown Sphere */}
            <div className="flex items-center justify-center py-6">
              <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-lg border-4 ${
                emergency.isActive
                  ? 'bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              }`}>
                <span className="text-4xl font-black font-mono tracking-tighter">
                  {emergency.isActive ? '🚨' : timeLeft}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-400">
                  {emergency.isActive ? 'Priority' : 'Sec Remaining'}
                </span>
              </div>
            </div>

            {/* Micro Countdown states for standard designers */}
            {!emergency.isActive && (
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl text-center border border-slate-800">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Phase Green</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {step === 'P1_GREEN' ? results.greenSplit.nb_sb_seconds : step === 'P2_GREEN' ? results.greenSplit.eb_wb_seconds : '-'}s
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Clearance (Amber)</span>
                  <span className="text-xs font-bold text-emerald-400">2.0s</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Total Loop</span>
                  <span className="text-xs font-extrabold text-white">
                    {results.cycleTime.optimalCycleTime} sec
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {isPlaying ? (
                <button
                  id="btn-suspend-sim"
                  onClick={() => setIsPlaying(false)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-850 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  Suspend Run
                </button>
              ) : (
                <button
                  id="btn-play-sim"
                  onClick={() => setIsPlaying(true)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  Resume Simulation
                </button>
              )}
              
              <button
                id="btn-reset-seconds"
                onClick={handleReset}
                className="px-4 py-3 border border-slate-800 text-slate-400 hover:bg-slate-850 rounded-2xl flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Restart Sequence"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Emergency Management Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
              Screen 17: Emergency Clearance Intervention
            </h4>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Activate priority corridor. Selecting an ambulance or fire rescue vehicle immediately halts other flows to Green-signal the chosen rescue approach.
            </p>

            {emergency.isActive ? (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <div>
                    <h5 className="font-bold">EXCLUSION LOCK ACTIVE</h5>
                    Priority clearance path routing for <span className="font-extrabold text-rose-300">{emergency.vehicleType}</span> from the <span className="font-extrabold text-rose-300">{emergency.direction?.toUpperCase()}</span> entrance lane.
                  </div>
                </div>
                <button
                  id="btn-restore-normal-webster"
                  onClick={deactivateEmergency}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Deactivate & Restore Webster Loop
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual grid select */}
                <div className="grid grid-cols-3 gap-2">
                  {(['Ambulance', 'Fire Truck', 'Police Vehicle'] as const).map((v) => (
                    <div key={v} className="bg-slate-950 text-center p-2 rounded-xl text-xs border border-slate-800 font-bold">
                      <span className="block text-base">{v === 'Ambulance' ? '🚑' : v === 'Fire Truck' ? '🚒' : '🚓'}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Target direction list */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450 block">Select Priority Approach:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['nb', 'sb', 'eb', 'wb'] as const).map((dir) => (
                      <button
                        id={`btn-emergency-${dir}`}
                        key={dir}
                        onClick={() => activateEmergency('Ambulance', dir)}
                        className="py-2 rounded-xl text-[10px] font-bold bg-slate-950 text-emerald-400 border border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/20 active:scale-95 transition-all cursor-pointer text-center"
                      >
                        {dir.toUpperCase()} Green
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-analytics"
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Check Traffic Metrics
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
