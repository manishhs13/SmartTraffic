/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Camera, Image, Check, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import { JunctionData, JunctionImage, DirectionKey } from '../types';

interface JunctionDiagramSVGProps {
  data: JunctionData;
  imageConfig: JunctionImage;
  onImageChange: (newImg: JunctionImage) => void;
  activeSequence?: {
    nb: 'green' | 'amber' | 'red';
    sb: 'green' | 'amber' | 'red';
    eb: 'green' | 'amber' | 'red';
    wb: 'green' | 'amber' | 'red';
  };
  animateTraffic?: boolean;
}

export function JunctionDiagramSVG({
  data,
  imageConfig,
  onImageChange,
  activeSequence = { nb: 'red', sb: 'red', eb: 'red', wb: 'red' },
  animateTraffic = false
}: JunctionDiagramSVGProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraUploading, setCameraUploading] = useState(false);

  // Default road size factors
  const lanePx = 18; // px width per lane
  const nbWidth = Math.max(40, data.nb.lanes * lanePx * 2);
  const sbWidth = Math.max(40, data.sb.lanes * lanePx * 2);
  const ebWidth = Math.max(40, data.eb.lanes * lanePx * 2);
  const wbWidth = Math.max(40, data.wb.lanes * lanePx * 2);

  // SVG Geometry Constants
  const width = 450;
  const height = 450;
  const cx = width / 2;
  const cy = height / 2;

  // Compute road bounding lines
  const northX1 = cx - sbWidth / 2;
  const northX2 = cx + nbWidth / 2;
  const southX1 = cx - sbWidth / 2;
  const southX2 = cx + nbWidth / 2;

  const westY1 = cy - ebWidth / 2;
  const westY2 = cy + wbWidth / 2;
  const eastY1 = cy - ebWidth / 2;
  const eastY2 = cy + wbWidth / 2;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCameraUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange({
          sourceType: 'raw',
          dataUrl: event.target?.result as string,
        });
        setCameraUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateCameraShot = () => {
    setCameraUploading(true);
    setTimeout(() => {
      // Simulate taking a photo of a junction
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw an abstract top-down dark road crosshair layout representing a camera picture
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 480);
        
        ctx.fillStyle = '#334155';
        ctx.fillRect(260, 0, 120, 480);
        ctx.fillRect(0, 180, 640, 120);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(320, 0); ctx.lineTo(320, 480);
        ctx.moveTo(0, 240); ctx.lineTo(640, 240);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('CAMERA SURVEILLANCE FEED ACTIVE', 50, 60);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Junction: ${data.metadata.name || 'Site Alpha'}`, 50, 100);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Date: ${data.metadata.date || 'Today'}   Peak: ${data.metadata.peakHour || 'N/A'}`, 50, 140);
      }
      onImageChange({
        sourceType: 'raw',
        dataUrl: canvas.toDataURL('image/jpeg'),
      });
      setCameraUploading(false);
    }, 800);
  };

  const clearUploadedImage = () => {
    onImageChange({ sourceType: 'diagram' });
  };

  // Helper colors for signals
  const getSignalColor = (state: 'green' | 'amber' | 'red') => {
    if (state === 'green') return '#10b981'; // Emerald
    if (state === 'amber') return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div id="junction-geometry-diagram" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl bento-card shadow-lg shadow-slate-950/25">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Junction Layout & Visual Asset
          </h3>
          <p className="text-[10px] text-slate-450">
            {imageConfig.sourceType === 'raw' 
              ? 'Using field survey photo (Saved in Firebase)' 
              : 'Using dynamically generated design blueprint'}
          </p>
        </div>

        <div className="flex gap-2">
          {imageConfig.sourceType === 'raw' ? (
            <button
              id="btn-switch-blueprints"
              onClick={clearUploadedImage}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 border border-slate-800 hover:bg-slate-850 rounded-lg cursor-pointer transition-all"
            >
              Show Vector Map
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                id="btn-upload-surveillance"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-350 bg-slate-950 border border-slate-800 hover:bg-slate-850 rounded-lg cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Gallery
              </button>
              <button
                id="btn-trigger-camera"
                onClick={simulateCameraShot}
                disabled={cameraUploading}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg cursor-pointer transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                {cameraUploading ? 'Snapping...' : 'Shoot Cam'}
              </button>
            </div>
          )}
          <input
            id="surveillance-upload-input"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        {imageConfig.sourceType === 'raw' && imageConfig.dataUrl ? (
          <div className="relative w-full max-w-[360px] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
            <img 
              src={imageConfig.dataUrl} 
              alt="Junction Surveillance" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1 select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Storage Sync
            </div>
          </div>
        ) : (
          /* Live Vector Diagram generated using Width, Lane settings, and Signal positions */
          <div className="w-full max-w-[380px] bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-inner">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto drop-shadow-md select-none rounded-xl bg-slate-900"
            >
              {/* Background grass/terrain */}
              <rect width={width} height={height} fill="#0b0f19" />

              {/* Asphalt crossroads */}
              {/* Vertical Road (NB & SB) */}
              <rect
                x={northX1}
                y={0}
                width={northX2 - northX1}
                height={height}
                fill="#334155" // Slate-700
              />

              {/* Horizontal Road (EB & WB) */}
              <rect
                x={0}
                y={westY1}
                width={width}
                height={westY2 - westY1}
                fill="#334155"
              />

              {/* Central Junction intersection box */}
              <rect
                x={northX1}
                y={westY1}
                width={northX2 - northX1}
                height={westY2 - westY1}
                fill="#1e293b" // darker overlay for center
              />

              {/* Chevron indicators or arrows */}
              {/* Lane Divider Lines */}
              {/* North Leg Dash divider */}
              <line
                x1={cx} y1={0}
                x2={cx} y2={westY1}
                stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6,6"
              />
              {/* South Leg Dash divider */}
              <line
                x1={cx} y1={westY2}
                x2={cx} y2={height}
                stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6,6"
              />
              {/* West Leg Dash divider */}
              <line
                x1={0} y1={cy}
                x2={northX1} y2={cy}
                stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6,6"
              />
              {/* East Leg Dash divider */}
              <line
                x1={northX2} y1={cy}
                x2={width} y2={cy}
                stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6,6"
              />

              {/* Zebra Crossings (Pedestrian walks) */}
              {/* North Pedestrian Crossline */}
              <g stroke="#ffffff" strokeWidth="3" opacity="0.6">
                <line x1={northX1 + 3} y1={westY1 - 8} x2={northX2 - 3} y2={westY1 - 8} strokeWidth="2" />
                <line x1={northX1} y1={westY1 - 5} x2={northX1} y2={westY1 - 12} strokeWidth="4" strokeDasharray="1,2" />
                <line x1={northX1 + 5} y1={westY1 - 5} x2={northX1 + 5} y2={westY1 - 12} strokeWidth="4" />
                <line x1={northX1 + 15} y1={westY1 - 5} x2={northX1 + 15} y2={westY1 - 12} strokeWidth="4" />
                <line x1={northX1 + 25} y1={westY1 - 5} x2={northX1 + 25} y2={westY1 - 12} strokeWidth="4" />
                <line x1={northX2 - 15} y1={westY1 - 5} x2={northX2 - 15} y2={westY1 - 12} strokeWidth="4" />
                <line x1={northX2 - 5} y1={westY1 - 5} x2={northX2 - 5} y2={westY1 - 12} strokeWidth="4" />
              </g>

              {/* South Pedestrian Crossline */}
              <g stroke="#ffffff" strokeWidth="3" opacity="0.6">
                <line x1={southX1 + 3} y1={westY2 + 8} x2={southX2 - 3} y2={westY2 + 8} strokeWidth="2" />
                <line x1={southX1 + 5} y1={westY2 + 5} x2={southX1 + 5} y2={westY2 + 12} strokeWidth="4" />
                <line x1={southX1 + 15} y1={westY2 + 5} x2={southX1 + 15} y2={westY2 + 12} strokeWidth="4" />
                <line x1={southX1 + 25} y1={westY2 + 5} x2={southX1 + 25} y2={westY2 + 12} strokeWidth="4" />
                <line x1={southX2 - 15} y1={westY2 + 5} x2={southX2 - 15} y2={westY2 + 12} strokeWidth="4" />
                <line x1={southX2 - 5} y1={westY2 + 5} x2={southX2 - 5} y2={westY2 + 12} strokeWidth="4" />
              </g>

              {/* West Pedestrian Crossline */}
              <g stroke="#ffffff" strokeWidth="3" opacity="0.6">
                <line x1={northX1 - 8} y1={westY1 + 3} x2={northX1 - 8} y2={westY2 - 3} strokeWidth="2" />
                <line x1={northX1 - 5} y1={westY1 + 5} x2={northX1 - 12} y2={westY1 + 5} strokeWidth="4" />
                <line x1={northX1 - 5} y1={westY1 + 15} x2={northX1 - 12} y2={westY1 + 15} strokeWidth="4" />
                <line x1={northX1 - 5} y1={westY1 + 25} x2={northX1 - 12} y2={westY1 + 25} strokeWidth="4" />
                <line x1={northX1 - 5} y1={westY2 - 15} x2={northX1 - 12} y2={westY2 - 15} strokeWidth="4" />
                <line x1={northX1 - 5} y1={westY2 - 5} x2={northX1 - 12} y2={westY2 - 5} strokeWidth="4" />
              </g>

              {/* East Pedestrian Crossline */}
              <g stroke="#ffffff" strokeWidth="3" opacity="0.6">
                <line x1={northX2 + 8} y1={westY1 + 3} x2={northX2 + 8} y2={westY2 - 3} strokeWidth="2" />
                <line x1={northX2 + 5} y1={westY1 + 5} x2={northX2 + 12} y2={westY1 + 5} strokeWidth="4" />
                <line x1={northX2 + 5} y1={westY1 + 15} x2={northX2 + 12} y2={westY1 + 15} strokeWidth="4" />
                <line x1={northX2 + 5} y1={westY2 - 15} x2={northX2 + 12} y2={westY2 - 15} strokeWidth="4" />
                <line x1={northX2 + 5} y1={westY2 - 5} x2={northX2 + 12} y2={westY2 - 5} strokeWidth="4" />
              </g>

              {/* Road Labels */}
              <g fontSize="10" fontWeight="bold" fill="#ffffff" opacity="0.8" textAnchor="middle">
                <text x={cx} y={20}>NB LEG ({data.nb.lanes}L - {data.nb.roadWidth}m)</text>
                <text x={cx} y={height - 12}>SB LEG ({data.sb.lanes}L - {data.sb.roadWidth}m)</text>
                <text x={35} y={cy - ebWidth/2 - 4} textAnchor="start">EB LEG ({data.eb.lanes}L - {data.eb.roadWidth}m)</text>
                <text x={width - 5} y={cy + wbWidth/2 + 12} textAnchor="end">WB LEG ({data.wb.lanes}L - {data.wb.roadWidth}m)</text>
              </g>

              {/* Direction Flow Arrows inside Lanes */}
              {/* NB - Towards South. Lane travels downwards on left, upward on right etc. */}
              {/* Let's draw arrows for safety directions */}
              <g stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.9">
                {/* North downward */}
                <path d={`M ${cx + 10} 40 L ${cx + 10} 60 M ${cx + 7} 53 L ${cx + 10} 60 L ${cx + 13} 53`} />
                {/* South upward */}
                <path d={`M ${cx - 10} ${height - 40} L ${cx - 10} ${height - 60} M ${cx - 13} ${height - 53} L ${cx - 10} ${height - 60} L ${cx - 7} ${height - 53}`} />
                {/* East Leftward */}
                <path d={`M 40 ${cy - 10} L 60 ${cy - 10} M 53 ${cy - 13} L 60 ${cy - 10} L 53 ${cy - 7}`} />
                {/* West Rightward */}
                <path d={`M ${width - 40} ${cy + 10} L ${width - 60} ${cy + 10} M ${width - 53} ${cy + 13} L ${width - 60} ${cy + 10} L ${width - 53} ${cy + 7}`} />
              </g>

              {/* Real-time Glowing Signals */}
              {/* NB Approach Signal (Facing Cars coming down from North) */}
              <g transform={`translate(${northX2 + 8}, ${westY1 - 25})`}>
                <rect x="-6" y="-12" width="12" height="24" rx="3" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                <circle cx="0" cy="-6" r="3" fill={activeSequence.nb === 'red' ? '#ef4444' : '#551111'} />
                <circle cx="0" cy="0" r="3" fill={activeSequence.nb === 'amber' ? '#f59e0b' : '#553311'} />
                <circle cx="0" cy="6" r="3" fill={activeSequence.nb === 'green' ? '#10b981' : '#114422'} />
                <path d="M 0 12 L 0 20" stroke="#ffffff" strokeWidth="1.5" />
                {/* Signal active pulse indicator */}
                <circle cx="0" cy={activeSequence.nb === 'red' ? -6 : activeSequence.nb === 'amber' ? 0 : 6} r="5" fill="none" stroke={getSignalColor(activeSequence.nb)} strokeWidth="1" className="animate-ping" style={{ transformOrigin: '0px' }} />
              </g>

              {/* SB Approach Signal (Facing Cars coming up from South) */}
              <g transform={`translate(${southX1 - 8}, ${westY2 + 25})`}>
                <rect x="-6" y="-12" width="12" height="24" rx="3" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                <circle cx="0" cy="-6" r="3" fill={activeSequence.sb === 'red' ? '#ef4444' : '#551111'} />
                <circle cx="0" cy="0" r="3" fill={activeSequence.sb === 'amber' ? '#f59e0b' : '#553311'} />
                <circle cx="0" cy="6" r="3" fill={activeSequence.sb === 'green' ? '#10b981' : '#114422'} />
                <path d="M 0 -12 L 0 -20" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="0" cy={activeSequence.sb === 'red' ? -6 : activeSequence.sb === 'amber' ? 0 : 6} r="5" fill="none" stroke={getSignalColor(activeSequence.sb)} strokeWidth="1" className="animate-pulse" />
              </g>

              {/* EB Approach Signal (Facing Cars coming from East on Left) */}
              <g transform={`translate(${northX1 - 25}, ${westY1 - 8})`}>
                <rect x="-12" y="-6" width="24" height="12" rx="3" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                <circle cx="-6" cy="0" r="3" fill={activeSequence.eb === 'red' ? '#ef4444' : '#551111'} />
                <circle cx="0" cy="0" r="3" fill={activeSequence.eb === 'amber' ? '#f59e0b' : '#553311'} />
                <circle cx="6" cy="0" r="3" fill={activeSequence.eb === 'green' ? '#10b981' : '#114422'} />
                <path d="M 12 0 L 20 0" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={activeSequence.eb === 'red' ? -6 : activeSequence.eb === 'amber' ? 0 : 6} cy="0" r="5" fill="none" stroke={getSignalColor(activeSequence.eb)} strokeWidth="1" className="animate-pulse" />
              </g>

              {/* WB Approach Signal (Facing Cars coming from West on Right) */}
              <g transform={`translate(${northX2 + 25}, ${westY2 + 8})`}>
                <rect x="-12" y="-6" width="24" height="12" rx="3" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                <circle cx="-6" cy="0" r="3" fill={activeSequence.wb === 'red' ? '#ef4444' : '#551111'} />
                <circle cx="0" cy="0" r="3" fill={activeSequence.wb === 'amber' ? '#f59e0b' : '#553311'} />
                <circle cx="6" cy="0" r="3" fill={activeSequence.wb === 'green' ? '#10b981' : '#114422'} />
                <path d="M -12 0 L -20 0" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={activeSequence.wb === 'red' ? -6 : activeSequence.wb === 'amber' ? 0 : 6} cy="0" r="5" fill="none" stroke={getSignalColor(activeSequence.wb)} strokeWidth="1" className="animate-pulse" />
              </g>

              {/* Simulated Flowing Particles (Vehicles moving only if green phase active) */}
              {animateTraffic && (
                <g>
                  {/* Phase 1 Stream (NB and SB Green) */}
                  {activeSequence.nb === 'green' && (
                    <>
                      <circle cx={cx + 10} cy="20" r="3.5" fill="#38bdf8">
                        <animate attributeName="cy" from="20" to={height - 20} dur="2.2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={cx + 18} cy="50" r="4.2" fill="#f43f5e" className="opacity-80">
                        <animate attributeName="cy" from="50" to={height} dur="2.6s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {activeSequence.sb === 'green' && (
                    <>
                      <circle cx={cx - 10} cy={height - 20} r="3.5" fill="#10b981">
                        <animate attributeName="cy" from={height - 20} to="20" dur="2.1s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={cx - 18} cy={height - 80} r="4.5" fill="#fbbf24">
                        <animate attributeName="cy" from={height - 80} to="0" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* Phase 2 Stream (EB and WB Green) */}
                  {activeSequence.eb === 'green' && (
                    <>
                      <circle cx="20" cy={cy - 10} r="3.5" fill="#f43f5e">
                        <animate attributeName="cx" from="20" to={width - 20} dur="2.3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="60" cy={cy - 18} r="4" fill="#a855f7">
                        <animate attributeName="cx" from="60" to={width} dur="2.7s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {activeSequence.wb === 'green' && (
                    <>
                      <circle cx={width - 20} cy={cy + 10} r="3.5" fill="#38bdf8">
                        <animate attributeName="cx" from={width - 20} to="20" dur="2.0s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={width - 80} cy={cy + 18} r="4.5" fill="#10b981">
                        <animate attributeName="cx" from={width - 80} to="0" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {cameraUploading && (
        <div className="text-center py-2 text-xs font-semibold text-amber-600 animate-pulse">
          • Synchronizing raw image to Firebase Storage Bucket...
        </div>
      )}
    </div>
  );
}
