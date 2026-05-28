/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DirectionCounts, CalculationsResult } from '../types';
import { VECHICLE_TYPES } from '../data/pcuValues';
import { ArrowRight, Info, Compass, Sparkles } from 'lucide-react';

interface PCUTableDisplayProps {
  counts: DirectionCounts;
  results: CalculationsResult;
  onNext: () => void;
}

export function PCUTableDisplay({ counts, results, onNext }: PCUTableDisplayProps) {
  const directions: { key: 'nb' | 'sb' | 'eb' | 'wb'; label: string; color: string }[] = [
    { key: 'nb', label: 'NB', color: 'bg-emerald-500/10 text-emerald-400' },
    { key: 'sb', label: 'SB', color: 'bg-emerald-500/10 text-emerald-400' },
    { key: 'eb', label: 'EB', color: 'bg-emerald-500/10 text-emerald-400' },
    { key: 'wb', label: 'WB', color: 'bg-emerald-500/10 text-emerald-400' },
  ];

  return (
    <div id="pcu-analysis-wrapper" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">PCU Coeffs & Normalization</h2>
          <p className="text-xs text-slate-400">Step 3: Normalizing heterogeneous traffic stream components to standardized Passenger Car Units</p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs text-emerald-300 flex gap-3 bento-card">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-0.5">IRC Traffic Standardization (PCU)</h4>
          Heterogeneous flow contains different vehicle volumes (motorcycles, trucks, auto-rickshaws) taking up different amounts of static road space and moving at different speeds. By multiplying each vehicle class by its relative Passenger Car Unit factor (PCU), we derive a standardized homogeneous flow rate (PCU/hour) which serves as the core input for Webster's signal timing equations.
        </div>
      </div>

      {/* Grid of Direction Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {directions.map((d) => (
          <div key={d.key} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between bento-card shadow-lg shadow-slate-950/20">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start ${d.color}`}>
              {d.label} Approach
            </span>
            <div className="mt-4">
              <span className="text-2xl font-black text-white">
                {results.pcuHourly[d.key]}
              </span>
              <span className="text-slate-500 text-xs font-semibold ml-1">PCU/hr</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Raw Count: {Object.values(counts[d.key]).reduce((a, b) => a + (b || 0), 0)} vehicles
            </span>
          </div>
        ))}
      </div>

      {/* Primary Table layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase">
                <th className="py-3 px-4 font-bold text-[10px]">Vehicle Class</th>
                <th className="py-3 px-4 font-bold text-[10px] text-center">PCU Coeff</th>
                <th className="py-3 px-4 font-bold text-[10px] text-center bg-slate-950/30">NB Count / PCU</th>
                <th className="py-3 px-4 font-bold text-[10px] text-center bg-slate-950/50">SB Count / PCU</th>
                <th className="py-3 px-4 font-bold text-[10px] text-center bg-slate-950/30">EB Count / PCU</th>
                <th className="py-3 px-4 font-bold text-[10px] text-center bg-slate-950/50">WB Count / PCU</th>
                <th className="py-3 px-4 font-bold text-[10px] text-right font-bold">Aggregate Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {VECHICLE_TYPES.map((v) => {
                const nbVal = counts.nb[v.id] || 0;
                const sbVal = counts.sb[v.id] || 0;
                const ebVal = counts.eb[v.id] || 0;
                const wbVal = counts.wb[v.id] || 0;

                const nbPcu = nbVal * v.pcuValue;
                const sbPcu = sbVal * v.pcuValue;
                const ebPcu = ebVal * v.pcuValue;
                const wbPcu = wbVal * v.pcuValue;

                const totalUnitCount = nbVal + sbVal + ebVal + wbVal;
                const totalUnitPcu = totalUnitCount * v.pcuValue;

                return (
                  <tr key={v.id} className="hover:bg-slate-850/30 font-medium">
                    <td className="py-2.5 px-4 font-bold text-slate-200">
                      {v.name}
                    </td>
                    <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">
                      {v.pcuValue}
                    </td>
                    <td className="py-2.5 px-4 text-center bg-slate-950/30 text-slate-300">
                      {nbVal} <span className="text-[10px] text-slate-550">({nbPcu.toFixed(1)})</span>
                    </td>
                    <td className="py-2.5 px-4 text-center bg-slate-950/50 text-slate-300">
                      {sbVal} <span className="text-[10px] text-slate-550">({sbPcu.toFixed(1)})</span>
                    </td>
                    <td className="py-2.5 px-4 text-center bg-slate-950/30 text-slate-300">
                      {ebVal} <span className="text-[10px] text-slate-550">({ebPcu.toFixed(1)})</span>
                    </td>
                    <td className="py-2.5 px-4 text-center bg-slate-950/50 text-slate-300">
                      {wbVal} <span className="text-[10px] text-slate-550">({wbPcu.toFixed(1)})</span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-white font-bold">
                      {totalUnitCount} Units <span className="text-emerald-400">({totalUnitPcu.toFixed(1)} PCU)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-955 font-extrabold text-white border-t border-slate-800">
                <td className="py-4 px-4 text-sm font-black text-emerald-400">Normalized Total Flow Rate</td>
                <td className="py-4 px-4 text-center text-slate-500 font-normal">-</td>
                <td className="py-4 px-4 text-center text-emerald-400 text-sm">{results.pcuHourly.nb} PCU/hr</td>
                <td className="py-4 px-4 text-center text-emerald-400 text-sm">{results.pcuHourly.sb} PCU/hr</td>
                <td className="py-4 px-4 text-center text-emerald-400 text-sm">{results.pcuHourly.eb} PCU/hr</td>
                <td className="py-4 px-4 text-center text-emerald-400 text-sm">{results.pcuHourly.wb} PCU/hr</td>
                <td className="py-4 px-4 text-right text-emerald-400 text-base">{results.pcuHourly.total} PCU/hr</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-calculations"
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Check Geometry Calculations
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
