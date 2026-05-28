/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoryRecord } from '../types';
import { Trash2, Columns, Info, Check, CornerDownLeft, Sparkles, FolderOpen, ArrowLeftRight } from 'lucide-react';

interface HistoryAndCompareProps {
  records: HistoryRecord[];
  onDeleteRecord: (id: string) => void;
  onLoadRecord: (record: HistoryRecord) => void;
  onNext: () => void;
}

export function HistoryAndCompare({ records, onDeleteRecord, onLoadRecord, onNext }: HistoryAndCompareProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(item => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        // Shift out first, append new
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const getCompareRecords = () => {
    return records.filter(r => selectedForCompare.includes(r.id));
  };

  const comparedItems = getCompareRecords();

  const handleStartComparison = () => {
    if (comparedItems.length === 2) {
      setIsComparing(true);
    }
  };

  return (
    <div id="history-and-comparison-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Records Vault & Junction Compares</h2>
          <p className="text-xs text-slate-400">Step 6: Historical ledger of physical survey surveys, comparing designs side-by-side</p>
        </div>
      </div>

      {isComparing && comparedItems.length === 2 ? (
        // Comparison screen overlay
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-4.5 h-4.5 text-emerald-400" />
                Dual-Junction Comparative Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Statistical metrics contrasting structural and volume traits</p>
            </div>
            <button
              id="btn-close-compare"
              onClick={() => setIsComparing(false)}
              className="px-4 py-2 text-xs font-bold bg-slate-950 border border-slate-800 text-slate-350 rounded-xl hover:bg-slate-850 transition-all active:scale-95 cursor-pointer"
            >
              Exit Comparison Grid
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {comparedItems.map((record, index) => (
              <div key={record.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg shadow-slate-950/25">
                <div className={`p-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider self-start inline-block ${
                  index === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-teal-500/10 text-teal-300'
                }`}>
                  Junction Schema #{index + 1}
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-white leading-tight">
                    {record.junction.metadata.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {record.junction.metadata.location} • {record.savedAt}
                  </p>
                </div>

                {/* Properties list */}
                <div className="divide-y divide-slate-800 text-xs text-slate-450 space-y-2 pt-2">
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Survey Peak Hour:</span>
                    <span className="font-bold text-white">{record.junction.metadata.peakHour}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Total Demanded PCU/hr:</span>
                    <span className="font-bold text-emerald-400">{record.results.pcuHourly.total} PCU/hr</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Webster Cycle Time ($C_0$):</span>
                    <span className="font-bold text-white">{record.results.cycleTime.optimalCycleTime} seconds</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Lost Cycles Period ($L$):</span>
                    <span className="font-bold text-white">{record.results.lostTime.totalLostTime} seconds</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Level of Service (LOS):</span>
                    <span className="font-bold text-emerald-400">LOS {record.results.los.grade} ({record.results.los.condition})</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">System Efficiency:</span>
                    <span className="font-bold text-white">{record.results.performance.efficiency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Approach Saturation (NB/SB/EB/WB):</span>
                    <span className="font-bold text-white">
                      {record.results.saturationFlow.nb} / {record.results.saturationFlow.sb} / {record.results.saturationFlow.eb} / {record.results.saturationFlow.wb}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-slate-400">Green splits (P1 / P2):</span>
                    <span className="font-bold text-emerald-400">
                      Phase 1: {record.results.greenSplit.nb_sb_seconds}s | Phase 2: {record.results.greenSplit.eb_wb_seconds}s
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-load-compare-${index}`}
                  onClick={() => { onLoadRecord(record); setIsComparing(false); }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Load to Active workspace
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Standard records list view
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold block text-white uppercase tracking-widest">
                Compare Junction performance
              </span>
              <p className="text-[11px] text-slate-400 leading-none">
                Select exactly any <span className="font-extrabold text-emerald-400">2 junctions</span> from the vault below to compile contrast grids
              </p>
            </div>
            {selectedForCompare.length === 2 && (
              <button
                id="btn-run-compare-action"
                onClick={handleStartComparison}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                Assemble Comparison Map
                <ArrowLeftRight className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-lg shadow-slate-950/20">
              <div className="inline-flex p-3 bg-slate-950 border border-slate-850 rounded-2xl text-emerald-400">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white">Engineering vault is empty</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No traffic survey sessions registered yet. Capture some classified vehicle counts and tap "Save Record to History" in the side workflow window.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => {
                const isSelected = selectedForCompare.includes(r.id);
                return (
                  <div
                    key={r.id}
                    className={`bg-slate-900 border p-4 rounded-2xl shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-950/15' 
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Check select for comparison */}
                      <button
                        id={`btn-compare-checkbox-${r.id}`}
                        onClick={() => toggleSelectForCompare(r.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer mt-1 ${
                          isSelected 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : 'border-slate-700 hover:border-emerald-400 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onLoadRecord(r)}>
                            {r.junction.metadata.name}
                          </h4>
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 text-emerald-400 rounded font-bold border border-slate-800">
                            LOS {r.results.los.grade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {r.junction.metadata.location} • <span className="font-semibold text-slate-300">Total Volume: {r.results.pcuHourly.total} PCU/hr</span>
                        </p>
                        <span className="text-[10px] text-slate-500 block pt-0.5">
                          Survey Date: {r.junction.metadata.date} | Saved: {r.savedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-slate-800 md:border-t-0 pt-2.5 md:pt-0">
                      <button
                        id={`btn-load-record-${r.id}`}
                        onClick={() => onLoadRecord(r)}
                        className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Restore Workspace
                      </button>
                      <button
                        id={`btn-delete-record-${r.id}`}
                        onClick={() => onDeleteRecord(r.id)}
                        className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-reports-tab"
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Check Official Reports
          <FolderOpen className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
