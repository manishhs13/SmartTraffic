/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CalculationsResult, DirectionCounts } from '../types';
import { VECHICLE_TYPES } from '../data/pcuValues';
import { TrendingUp, AlertTriangle, Flame, Layers } from 'lucide-react';

interface AnalyticsChartsProps {
  counts: DirectionCounts;
  results: CalculationsResult;
  onNext: () => void;
}

export function AnalyticsCharts({ counts, results, onNext }: AnalyticsChartsProps) {
  // Chart 1: Approach Volume vs Saturation Flow
  const capacityData = [
    { name: 'North Bound (NB)', Volume: results.pcuHourly.nb, Saturation: results.saturationFlow.nb },
    { name: 'South Bound (SB)', Volume: results.pcuHourly.sb, Saturation: results.saturationFlow.sb },
    { name: 'East Bound (EB)', Volume: results.pcuHourly.eb, Saturation: results.saturationFlow.eb },
    { name: 'West Bound (WB)', Volume: results.pcuHourly.wb, Saturation: results.saturationFlow.wb },
  ];

  // Chart 2: Classified Vehicle Categories Split
  const categorySummary: { [key: string]: number } = {
    'Two-Wheelers': 0,
    'Three-Wheelers': 0,
    'Cars/SUVs': 0,
    'Buses & Trucks': 0,
    'Others': 0
  };

  const directions: ('nb' | 'sb' | 'eb' | 'wb')[] = ['nb', 'sb', 'eb', 'wb'];
  directions.forEach(dir => {
    VECHICLE_TYPES.forEach(v => {
      const count = counts[dir][v.id] || 0;
      if (v.category === 'two_wheeler') categorySummary['Two-Wheelers'] += count;
      else if (v.category === 'three_wheeler') categorySummary['Three-Wheelers'] += count;
      else if (v.category === 'four_wheeler') categorySummary['Cars/SUVs'] += count;
      else if (v.category === 'heavy') categorySummary['Buses & Trucks'] += count;
      else categorySummary['Others'] += count;
    });
  });

  const pieData = Object.entries(categorySummary)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);

  // Default pie fallback if empty
  const graphPieData = pieData.length > 0 ? pieData : [
    { name: 'No Data', value: 1 }
  ];

  const PIE_COLORS = ['#10b981', '#34d399', '#059669', '#047857', '#065f46'];

  // Chart 3: Flow Ratios Line Profile
  const ratioData = [
    { name: 'NB', Ratio: results.flowRatio.nb },
    { name: 'SB', Ratio: results.flowRatio.sb },
    { name: 'EB', Ratio: results.flowRatio.eb },
    { name: 'WB', Ratio: results.flowRatio.wb },
  ];

  return (
    <div id="analytics-charts-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Survey Analytics & LOS</h2>
          <p className="text-xs text-slate-400">Step 5: Visual analytics, flow-share splits and signal capacity ratios</p>
        </div>
      </div>

      {/* LOS & Heat scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LOS Gauge */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl bento-card shadow-lg shadow-slate-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Level of Service (LOS)</span>
            <span className="text-3xl font-black text-white block">
              Grade {results.los.grade}
            </span>
            <span className="text-xs text-slate-400 font-semibold block">{results.los.condition}</span>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${
            results.los.grade === 'A' || results.los.grade === 'B'
              ? 'bg-emerald-500/10 text-emerald-400'
              : results.los.grade === 'C' || results.los.grade === 'D'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 text-rose-500'
          }`}>
            {results.los.grade}
          </div>
        </div>

        {/* Traffic Heat Gauge */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl bento-card shadow-lg shadow-slate-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Traffic Heat Indicator</span>
            <span className="text-3xl font-black text-white block">
              {results.los.heatColor === 'green' ? 'Low' : results.los.heatColor === 'yellow' ? 'Moderate' : 'Heavy'}
            </span>
            <span className="text-xs text-slate-400 font-semibold block">Intersection Volume Loads</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl text-emerald-400 border border-slate-800">
            <Flame className={`w-8 h-8 ${results.los.heatColor === 'red' ? 'animate-bounce text-red-500' : ''}`} />
          </div>
        </div>

        {/* Demand Ratio Summary */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl bento-card shadow-lg shadow-slate-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Webster Demand Ratio</span>
            <span className="text-3xl font-black text-white block">
              {results.flowRatio.sumY.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400 font-semibold block">Critical Phase Load Limit: 1.00</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl text-emerald-400 border border-slate-800">
            <Layers className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Bar Chart of Demand Volume vs Saturation Flow */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg shadow-slate-950/20">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Demanded Volume vs Saturation Flow Capacity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Compares hourly approach vehicle load against stopline maximum clearance volumes</p>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={capacityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontSize: '11px', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Volume" name="Demanded Flow (PCU/hr)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saturation" name="Saturation Cap (PCU/hr)" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie Chart of Classified Vehicle Share */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg shadow-slate-950/20">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Classified Traffic Composition Split
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate flow representation across all 14 vehicle categories</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="w-full h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graphPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {graphPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontSize: '11px', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Detailed Percentages:</span>
              {graphPieData.map((item, index) => {
                const totalVal = graphPieData.reduce((sum, entry) => sum + entry.value, 0);
                const percent = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : '0';
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-350">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{percent}% ({item.value})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 3: Line graph of Flow Ratios (y) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg shadow-slate-950/20 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Approach Flow Ratio Trendline ($y_i = q_i / S_i$)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Displays approach congestion load gradients; ratios near 0.50 warrant immediate green splits</p>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ratioData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontSize: '11px', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Ratio" name="Flow Ratio (y)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="btn-goto-history-tab"
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Check Records Directory
          <TrendingUp className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
