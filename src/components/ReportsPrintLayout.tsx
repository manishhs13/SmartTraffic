/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JunctionData, CalculationsResult, DirectionCounts, JunctionImage } from '../types';
import { VECHICLE_TYPES } from '../data/pcuValues';
import { Printer, FileSpreadsheet, Sparkles, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { JunctionDiagramSVG } from './JunctionDiagramSVG';

interface ReportsPrintLayoutProps {
  junction: JunctionData;
  counts: DirectionCounts;
  image: JunctionImage;
  results: CalculationsResult;
}

export function ReportsPrintLayout({ junction, counts, image, results }: ReportsPrintLayoutProps) {
  
  // PDF Trigger via Print Styles
  const selectPrintAction = () => {
    window.print();
  };

  // CSV Generator for Excel
  const selectExcelAction = () => {
    let csv = '';
    csv += 'SMARTSIGNAL SURVEY DESIGN REPORT\n';
    csv += '====================================\n\n';
    
    csv += '1. METADATA PROFILE\n';
    csv += `Junction Name,${junction.metadata.name}\n`;
    csv += `Location / City,${junction.metadata.location}\n`;
    csv += `Survey Date,${junction.metadata.date}\n`;
    csv += `Survey Time,${junction.metadata.time}\n`;
    csv += `Identified Peak Hour,${junction.metadata.peakHour}\n\n`;

    csv += '2. GEOMETRICAL ROAD WIDTHS\n';
    csv += 'Direction,Width (m),Lanes\n';
    csv += `North Bound (NB),${junction.nb.roadWidth},${junction.nb.lanes}\n`;
    csv += `South Bound (SB),${junction.sb.roadWidth},${junction.sb.lanes}\n`;
    csv += `East Bound (EB),${junction.eb.roadWidth},${junction.eb.lanes}\n`;
    csv += `West Bound (WB),${junction.wb.roadWidth},${junction.wb.lanes}\n\n`;

    csv += '3. CLASSIFIED VEHICLE COUNT INVENTORY\n';
    csv += 'Vehicle Type,PCU Factor,NB Count,SB Count,EB Count,WB Count,NB PCU,SB PCU,EB PCU,WB PCU,Total PCU\n';
    VECHICLE_TYPES.forEach(v => {
      const nb = counts.nb[v.id] || 0;
      const sb = counts.sb[v.id] || 0;
      const eb = counts.eb[v.id] || 0;
      const wb = counts.wb[v.id] || 0;
      csv += `"${v.name}",${v.pcuValue},${nb},${sb},${eb},${wb},${nb*v.pcuValue},${sb*v.pcuValue},${eb*v.pcuValue},${wb*v.pcuValue},${(nb+sb+eb+wb)*v.pcuValue}\n`;
    });
    csv += '\n';

    csv += '4. ENGINEERING WEBSTER CALCULATIONS SUMMARY\n';
    csv += `Metric,Value,Unit\n`;
    csv += `Total Intersection Flow Rate,${results.pcuHourly.total},PCU/hr\n`;
    csv += `NB Saturation Flow,${results.saturationFlow.nb},PCU/hr\n`;
    csv += `SB Saturation Flow,${results.saturationFlow.sb},PCU/hr\n`;
    csv += `EB Saturation Flow,${results.saturationFlow.eb},PCU/hr\n`;
    csv += `WB Saturation Flow,${results.saturationFlow.wb},PCU/hr\n`;
    csv += `Sum Flow Ratio (Y sum),${results.flowRatio.sumY.toFixed(4)},-\n`;
    csv += `Total System Lost Time (L),${results.lostTime.totalLostTime},seconds\n`;
    csv += `Webster Optimal Cycle Time (C0),${results.cycleTime.optimalCycleTime},seconds\n`;
    csv += `Total Effective Green Time (G),${results.effectiveGreen.totalEffectiveGreen},seconds\n`;
    csv += `Phase 1 Green Split (NB/SB),${results.greenSplit.nb_sb_seconds},seconds\n`;
    csv += `Phase 2 Green Split (EB/WB),${results.greenSplit.eb_wb_seconds},seconds\n`;
    csv += `Acreage Operational Efficiency,${results.performance.efficiency.toFixed(1)},%\n`;
    csv += `Estimated Control Delay per Vehicle,${results.los.delay.toFixed(1)},seconds/veh\n`;
    csv += `Level of Service (LOS),${results.los.grade},${results.los.condition}\n`;

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartSignal_Report_${junction.metadata.name.replace(/\s+/g, '_') || 'Run'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logic recommendation comments based on calculated Level of service
  const generateAnalysisComment = () => {
    const grade = results.los.grade;
    if (grade === 'A' || grade === 'B') {
      return {
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />,
        text: 'Optimal Flow performance: The junction geometry has satisfactory width to handle current vehicle loads. The calculated Webster cycle lengths offer efficient green phases, preventing excessive queue buildup. No immediate geometrical transformations required.',
        status: 'Optimal conditions'
      };
    }
    if (grade === 'C' || grade === 'D') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5" />,
        text: 'Stable and tolerable congestion: Traffic volume is approaching baseline lanes capacities during peak hour windows. Monitor lane splits. Enforcing minor stopline bans on turning movements or creating custom right-turn lanes can further optimize vehicular delay ratios.',
        status: 'Stable - monitor loads'
      };
    }
    // LOS E / F
    return {
      icon: <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 animate-bounce" />,
      text: 'OVERSATURATED CONGESTION DETECTED: Demanded stream volumes exceed the entry throat capabilities. Signal cycles alone are insufficient. Recommend physical roadway widenings, adding exclusive left/right turn slots, or civil grade transitions (underpasses/flyovers).',
      status: 'Civil Expansion Indicated'
    };
  };

  const adviceComment = generateAnalysisComment();

  return (
    <div id="reports-print-wrapper" className="space-y-6">
      {/* Configuration Action Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white">Export & Report Dispatch</h2>
          <p className="text-xs text-slate-400">Step 7: Compiles complete blueprints, counts, calculations into official report formats</p>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-excel-dispatch"
            onClick={selectExcelAction}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel Raw Export (.CSV)
          </button>
          <button
            id="btn-pdf-dispatch"
            onClick={selectPrintAction}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:bg-slate-900"
          >
            <Printer className="w-4 h-4" />
            Print / Save to PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet styling container */}
      <div 
        id="official-print-paper-sheet" 
        className="bg-slate-900 border border-slate-800 p-6 sm:p-9 rounded-3xl shadow-lg max-w-[800px] mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-slate-100"
      >
        {/* Document Header banner */}
        <div className="border-b-4 border-slate-800 pb-5 flex justify-between items-end">
          <div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest block leading-none">
              Civil Engineering Commission
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              SmartSignal Assessment Report
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
              Classified Survey, PCU Analysis & Webster Signal Timing Design
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-mono">
            <div>SYSTEM REPORT REF</div>
            <div className="font-bold text-slate-200">SS-ASSESS-0982-A</div>
          </div>
        </div>

        {/* Informational Profile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 text-xs text-slate-400">
          <div>
            <span className="block font-bold text-[9px] uppercase text-slate-500">Junction Name</span>
            <span className="font-extrabold text-white">{junction.metadata.name || 'N/A'}</span>
          </div>
          <div>
            <span className="block font-bold text-[9px] uppercase text-slate-500">Location City</span>
            <span className="font-bold text-slate-200">{junction.metadata.location || 'N/A'}</span>
          </div>
          <div>
            <span className="block font-bold text-[9px] uppercase text-slate-500">Date & Survey Timestamp</span>
            <span className="font-bold text-slate-200">{junction.metadata.date} | {junction.metadata.time}</span>
          </div>
          <div>
            <span className="block font-bold text-[9px] uppercase text-slate-500">Peak Duration</span>
            <span className="font-bold text-slate-200">{junction.metadata.peakHour || 'Peak hour stream'}</span>
          </div>
        </div>

        {/* Lane geometry table */}
        <div className="py-4 border-t border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-slate-200">
            Junction Roadway Characteristics & Sizing metrics
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center text-xs">
            {(['nb', 'sb', 'eb', 'wb'] as const).map((dir) => (
              <div key={dir} className="bg-slate-950 border border-slate-850 p-2 rounded-xl">
                <span className="text-[9px] uppercase font-bold block text-slate-500">{dir.toUpperCase()} Bound</span>
                <div className="font-black text-sm text-white mt-0.5">
                  Width: {junction[dir].roadWidth}m
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">{junction[dir].lanes} Lanes</div>
              </div>
            ))}
          </div>
        </div>

        {/* SVG Drawing embedded */}
        <div className="py-5 border-t border-slate-800 flex flex-col items-center print:break-inside-avoid">
          <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-slate-200 self-start">
            Junction Layout vector drawing (Blueprint Asset)
          </h3>
          <div className="w-64 border border-slate-800 rounded-xl p-1.5 bg-slate-950">
            <JunctionDiagramSVG
              data={junction}
              imageConfig={image}
              onImageChange={() => {}}
              animateTraffic={false}
            />
          </div>
        </div>

        {/* Analysis calculations summary block */}
        <div className="py-4 border-t border-slate-800 print:break-inside-avoid">
          <h3 className="text-xs font-black uppercase tracking-wider mb-2.5 text-slate-200">
            Webster Cycle Synthesis & Demand Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs text-slate-400">
            <div>
              <span className="block font-bold text-[9px] uppercase text-slate-500">Total Junction Demand Volume</span>
              <span className="font-extrabold text-emerald-400">{results.pcuHourly.total} PCU/hr</span>
            </div>
            <div>
              <span className="block font-bold text-[9px] uppercase text-slate-550">Sum of Critical Flow Ratios (Y)</span>
              <span className="font-bold text-white">{results.flowRatio.sumY.toFixed(4)}</span>
            </div>
            <div>
              <span className="block font-bold text-[9px] uppercase text-slate-500">Level of Service (LOS)</span>
              <span className="font-bold text-white">LOS {results.los.grade} ({results.los.condition})</span>
            </div>
            <div>
              <span className="block font-bold text-[9px] uppercase text-slate-500">Webster Optimal Cycle (C0)</span>
              <span className="font-bold text-white">{results.cycleTime.optimalCycleTime} seconds</span>
            </div>
            <div>
              <span className="block font-bold text-[9px] uppercase text-slate-500">Clearance Lost Times per Loop (L)</span>
              <span className="font-bold text-white">{results.lostTime.totalLostTime} seconds</span>
            </div>
            <div>
              <span className="block font-bold text-[9px] uppercase text-slate-500">Geometrical Saturated Flow Rates</span>
              <span className="font-bold text-white">
                NB: {results.saturationFlow.nb} | SB: {results.saturationFlow.sb} | EB: {results.saturationFlow.eb} | WB: {results.saturationFlow.wb}
              </span>
            </div>
          </div>
        </div>

        {/* Phase signals split timing sheets */}
        <div className="py-4 border-t border-slate-800 print:break-inside-avoid">
          <h3 className="text-xs font-black uppercase tracking-wider mb-2.5 text-slate-200">
            Approach Split Timing Allocation (Webster Signal Settings)
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 font-bold uppercase text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-4">Approach Direction</th>
                  <th className="py-2.5 px-4 text-center">Green Phase</th>
                  <th className="py-2.5 px-4 text-center">Amber Clearance</th>
                  <th className="py-1 px-4 text-center">Red Stop-phase</th>
                  <th className="py-1 px-4 text-right">Cycle Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium text-slate-350 bg-slate-900">
                {(['nb', 'sb', 'eb', 'wb'] as const).map((dir) => {
                  const s = results.signalTiming[dir];
                  return (
                    <tr key={dir} className="h-9">
                      <td className="py-1 px-4 font-bold text-slate-200">{dir.toUpperCase()} Bound Lane approach</td>
                      <td className="py-1 px-4 text-center font-bold text-emerald-400">{s.green}s</td>
                      <td className="py-1 px-4 text-center font-bold text-emerald-500/80">{s.amber}s</td>
                      <td className="py-1 px-4 text-center font-bold text-rose-450">{s.red}s</td>
                      <td className="py-1 px-4 text-right font-bold text-slate-500">{s.green + s.amber + s.red}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engineering diagnostic recommendations text box */}
        <div className="py-4 border-t border-slate-800 bg-slate-950 rounded-2xl p-4 mt-4 print:break-inside-avoid">
          <div className="flex gap-2 text-xs font-bold text-white uppercase mb-1.5 items-center">
            {adviceComment.icon}
            <span>Professional Analytical Diagnostics ({adviceComment.status})</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed italic">
            "{adviceComment.text}"
          </p>
        </div>

        {/* Commission Signature Stamps */}
        <div className="border-t border-dashed border-slate-800 pt-8 mt-12 grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-550 print:break-inside-avoid text-slate-500">
          <div>
            <div>CHIEF CIVIL TRAFFIC SURVEYOR</div>
            <div className="w-40 border-b border-slate-800 h-8 mt-2" />
            <div className="mt-1">Date: ________________________</div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div>SMARTSIGNAL INTEGRATED VERIFICATION</div>
            <div className="p-1 px-2 border border-slate-800 mt-4 rounded uppercase font-bold text-[8px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              AUTHENTIC DESIGN CERTIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
