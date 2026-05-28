/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DirectionCounts, DirectionKey, VehicleType } from '../types';
import { VECHICLE_TYPES } from '../data/pcuValues';
import { Plus, Minus, ArrowRight, RefreshCw, Trash2, Sliders, ChevronDown } from 'lucide-react';

interface VehicleEntryCounterProps {
  counts: DirectionCounts;
  onChange: (newCounts: DirectionCounts) => void;
  onNext: () => void;
}

export function VehicleEntryCounter({ counts, onChange, onNext }: VehicleEntryCounterProps) {
  const [activeDir, setActiveDir] = useState<DirectionKey>('nb');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const updateCount = (direction: DirectionKey, vehicleId: string, delta: number) => {
    const current = counts[direction][vehicleId] || 0;
    const nextVal = Math.max(0, current + delta);
    onChange({
      ...counts,
      [direction]: {
        ...counts[direction],
        [vehicleId]: nextVal,
      },
    });
  };

  const forceCountValue = (direction: DirectionKey, vehicleId: string, value: number) => {
    onChange({
      ...counts,
      [direction]: {
        ...counts[direction],
        [vehicleId]: Math.max(0, value),
      },
    });
  };

  const fillSimulatedSurvey = () => {
    // Generate realistic busy intersection hourly vehicle counts
    const mockCounts: DirectionCounts = {
      nb: {
        bicycle: 12, bike: 195, scooter: 130, auto_rickshaw: 45, car: 320, jeep: 15,
        van: 40, mini_bus: 8, bus: 22, truck: 10, tractor: 2, lcv: 18, heavy_vehicle: 5, multi_axle: 1
      },
      sb: {
        bicycle: 15, bike: 170, scooter: 120, auto_rickshaw: 35, car: 290, jeep: 10,
        van: 35, mini_bus: 6, bus: 18, truck: 8, tractor: 1, lcv: 14, heavy_vehicle: 4, multi_axle: 0
      },
      eb: {
        bicycle: 8, bike: 110, scooter: 80, auto_rickshaw: 60, car: 180, jeep: 8,
        van: 20, mini_bus: 4, bus: 12, truck: 15, tractor: 3, lcv: 25, heavy_vehicle: 10, multi_axle: 2
      },
      wb: {
        bicycle: 10, bike: 125, scooter: 95, auto_rickshaw: 50, car: 210, jeep: 12,
        van: 25, mini_bus: 5, bus: 15, truck: 12, tractor: 2, lcv: 22, heavy_vehicle: 8, multi_axle: 1
      }
    };
    onChange(mockCounts);
  };

  const clearAllCounts = () => {
    const emptyCounts: DirectionCounts = {
      nb: {}, sb: {}, eb: {}, wb: {}
    };
    VECHICLE_TYPES.forEach(v => {
      emptyCounts.nb[v.id] = 0;
      emptyCounts.sb[v.id] = 0;
      emptyCounts.eb[v.id] = 0;
      emptyCounts.wb[v.id] = 0;
    });
    onChange(emptyCounts);
  };

  const getDirTotalCount = (dir: DirectionKey) => {
    return Object.values(counts[dir]).reduce((sum, val) => sum + (val || 0), 0);
  };

  const getCategoryIcon = (category: VehicleType['category']) => {
    if (category === 'two_wheeler') return '🛵';
    if (category === 'three_wheeler') return '🛺';
    if (category === 'four_wheeler') return '🚗';
    if (category === 'heavy') return '🚌';
    return '🚲';
  };

  const directions: { key: DirectionKey; label: string; color: string; hover: string }[] = [
    { key: 'nb', label: 'North Bound (NB)', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10', hover: 'hover:bg-slate-800' },
    { key: 'sb', label: 'South Bound (SB)', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10', hover: 'hover:bg-slate-800' },
    { key: 'eb', label: 'East Bound (EB)', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10', hover: 'hover:bg-slate-800' },
    { key: 'wb', label: 'West Bound (WB)', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10', hover: 'hover:bg-slate-800' },
  ];

  const categories = [
    { id: 'all', name: 'All Vehicles' },
    { id: 'two_wheeler', name: 'Two Wheelers' },
    { id: 'three_wheeler', name: 'Rickshaws' },
    { id: 'four_wheeler', name: 'Saloons/SUVs' },
    { id: 'heavy', name: 'Buses & Trucks' },
    { id: 'other', name: 'Other' },
  ];

  const filteredVehicles = categoryFilter === 'all'
    ? VECHICLE_TYPES
    : VECHICLE_TYPES.filter(v => v.category === categoryFilter);

  return (
    <div id="vehicle-entry-counter-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Field Classified Volume Counts</h2>
          <p className="text-xs text-slate-400">Step 2: Collect classified vehicle-frequency counts per stream approach direction</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-fill-simulated-counts"
            onClick={fillSimulatedSurvey}
            className="px-3.5 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Inject Simulated Flow Counts
          </button>
          <button
            id="btn-clear-all-counts"
            onClick={clearAllCounts}
            className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Direction Selection Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {directions.map((d) => {
          const isActive = activeDir === d.key;
          const totalCount = getDirTotalCount(d.key);
          return (
            <button
              id={`dir-selector-${d.key}`}
              key={d.key}
              type="button"
              onClick={() => setActiveDir(d.key)}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                isActive
                  ? `${d.color} shadow-sm ring-2 ring-emerald-500/20`
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{d.label}</span>
              <span className="text-xl font-extrabold text-white mt-1">{totalCount}</span>
              <span className="text-[9px] text-slate-500 tracking-wide font-semibold mt-0.5">Vehicles Surveyed</span>
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Category Quick Filter */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        {categories.map(c => (
          <button
            id={`filter-cat-${c.id}`}
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
              categoryFilter === c.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Primary Grid count fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => {
          const currentCount = counts[activeDir][v.id] || 0;
          return (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 bento-card"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg leading-none" role="img" aria-label={v.category}>
                    {getCategoryIcon(v.category)}
                  </span>
                  <span className="text-sm font-bold text-slate-200 truncate block">
                    {v.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                  COEFF: <span className="text-emerald-400">{v.pcuValue} PCU</span>
                </div>
              </div>

              {/* Counter Buttons Combo */}
              <div className="flex items-center gap-1.5">
                <div className="flex flex-col gap-1">
                  <button
                    id={`btn-add5-${v.id}`}
                    onClick={() => updateCount(activeDir, v.id, 5)}
                    className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-950 border border-slate-850 text-slate-400 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    id={`btn-add10-${v.id}`}
                    onClick={() => updateCount(activeDir, v.id, 10)}
                    className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-950 border border-slate-850 text-slate-400 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                  >
                    +10
                  </button>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    id={`btn-dec-${v.id}`}
                    onClick={() => updateCount(activeDir, v.id, -1)}
                    disabled={currentCount === 0}
                    className="p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    id={`input-count-${v.id}`}
                    type="number"
                    min="0"
                    value={currentCount || ''}
                    onChange={(e) => forceCountValue(activeDir, v.id, parseInt(e.target.value, 10) || 0)}
                    className="w-10 text-center font-bold text-sm bg-transparent border-0 text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                  <button
                    id={`btn-inc-${v.id}`}
                    onClick={() => updateCount(activeDir, v.id, 1)}
                    className="p-1 text-slate-350 hover:bg-slate-850 rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-pcu-tab"
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Check PCU Conversions
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
