/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JunctionData, DirectionKey } from '../types';
import { Compass, Calendar, Clock, MapPin, Grid, Info, RefreshCw } from 'lucide-react';

interface JunctionInfoFormProps {
  data: JunctionData;
  onChange: (newData: JunctionData) => void;
  onNext: () => void;
}

export function JunctionInfoForm({ data, onChange, onNext }: JunctionInfoFormProps) {
  
  const updateMetadata = (field: keyof JunctionData['metadata'], value: string) => {
    onChange({
      ...data,
      metadata: {
        ...data.metadata,
        [field]: value
      }
    });
  };

  const updateDirection = (direction: DirectionKey, field: 'roadWidth' | 'lanes', value: number) => {
    onChange({
      ...data,
      [direction]: {
        ...data[direction],
        [field]: value
      }
    });
  };

  const loadExampleIntersection = () => {
    onChange({
      metadata: {
        name: 'Mahatma Gandhi Circular Cross',
        location: 'Ring Road Sector-5 Intersection',
        date: new Date().toISOString().split('T')[0],
        time: '17:30',
        peakHour: '17:00 - 18:00 (Evening peak)'
      },
      nb: { roadWidth: 7.5, lanes: 2 },
      sb: { roadWidth: 7.0, lanes: 2 },
      eb: { roadWidth: 10.5, lanes: 3 },
      wb: { roadWidth: 9.8, lanes: 3 }
    });
  };

  const directionsList: { key: DirectionKey; label: string; bg: string; color: string }[] = [
    { key: 'nb', label: 'North Bound (NB / Towards South)', bg: 'from-blue-500/5 to-blue-500/10', color: 'text-blue-500' },
    { key: 'sb', label: 'South Bound (SB / Towards North)', bg: 'from-sky-500/5 to-sky-500/10', color: 'text-sky-500' },
    { key: 'eb', label: 'East Bound (EB / Towards West)', bg: 'from-emerald-500/5 to-emerald-500/10', color: 'text-emerald-500' },
    { key: 'wb', label: 'West Bound (WB / Towards East)', bg: 'from-teal-500/5 to-teal-500/10', color: 'text-teal-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form id="junction-info-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Junction Configuration</h2>
          <p className="text-xs text-slate-400">Step 1: Input structural geometry, peak hours and geographical coordinates</p>
        </div>
        <button
          id="btn-load-example-junction"
          type="button"
          onClick={loadExampleIntersection}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl border border-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Load Demo Junction
        </button>
      </div>

      {/* General Information Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 bento-card shadow-lg shadow-slate-950/20">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-500" />
          General Investigation Report Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Junction Name
            </label>
            <div className="relative">
              <Compass className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={data.metadata.name}
                onChange={(e) => updateMetadata('name', e.target.value)}
                placeholder="e.g. MG Road - Outer Ring Junction"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Location / City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={data.metadata.location}
                onChange={(e) => updateMetadata('location', e.target.value)}
                placeholder="e.g. Bangalore, South-East Quad"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Date of Survey
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={data.metadata.date}
                onChange={(e) => updateMetadata('date', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Time of Survey
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="time"
                value={data.metadata.time}
                onChange={(e) => updateMetadata('time', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Identified Peak Hour
            </label>
            <div className="relative">
              <Grid className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={data.metadata.peakHour}
                onChange={(e) => updateMetadata('peakHour', e.target.value)}
                placeholder="e.g. 08:30 AM - 09:30 AM"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-600"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Geometry Layout */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Grid className="w-4 h-4 text-emerald-500" />
          Direction-wise Geometric Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {directionsList.map((dir) => (
            <div
              key={dir.key}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between bento-card hover:border-emerald-500/40"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-sm ${dir.color}`}>
                  <Compass className="w-4 h-4 transform rotate-[45deg]" />
                </div>
                <span className="text-xs font-bold text-white">{dir.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                    Road Width (Width X1)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="2.0"
                      max="30.0"
                      value={data[dir.key].roadWidth}
                      onChange={(e) => updateDirection(dir.key, 'roadWidth', parseFloat(e.target.value) || 3.0)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/25"
                      required
                    />
                    <span className="absolute right-3.5 text-xs text-slate-500">meters</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                    Number of Lanes
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={data[dir.key].lanes}
                      onChange={(e) => updateDirection(dir.key, 'lanes', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/25"
                      required
                    />
                    <span className="absolute right-3.5 text-xs text-slate-500">lanes</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-400 flex gap-2">
                <span>• Baseline saturation method:</span>
                <span className="font-semibold text-slate-300">
                  {data[dir.key].roadWidth > 5.5 ? 'Formula (525 × W)' : 'Lookup & Interpolate'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-diagram-tab"
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Confirm Geometry Details
          <Compass className="w-4 h-4 ml-1" />
        </button>
      </div>
    </form>
  );
}
