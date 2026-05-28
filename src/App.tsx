/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Layers,
  Activity,
  Calculator,
  Sliders,
  Timer,
  BarChart3,
  History,
  FileSpreadsheet,
  Sun,
  Moon,
  CloudLightning,
  Save,
  CheckCircle,
  Database,
  TrafficCone,
  LogOut,
  User,
  ExternalLink
} from 'lucide-react';

import {
  UserSession,
  JunctionData,
  DirectionCounts,
  JunctionImage,
  HistoryRecord,
  CalculationsResult
} from './types';
import { VECHICLE_TYPES } from './data/pcuValues';
import { runJunctionAnalysis } from './utils/trafficCalculations';

// Subcomponents
import { WelcomeScreen } from './components/WelcomeScreen';
import { JunctionInfoForm } from './components/JunctionInfoForm';
import { JunctionDiagramSVG } from './components/JunctionDiagramSVG';
import { VehicleEntryCounter } from './components/VehicleEntryCounter';
import { PCUTableDisplay } from './components/PCUTableDisplay';
import { CalculationsDashboard } from './components/CalculationsDashboard';
import { LiveSimulationController } from './components/LiveSimulationController';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { HistoryAndCompare } from './components/HistoryAndCompare';
import { ReportsPrintLayout } from './components/ReportsPrintLayout';

const STORAGE_RECORDS_KEY = 'smartsignal_survey_records_db';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Authentication & session management
  const [session, setSession] = useState<UserSession>({
    email: null,
    isGuest: false,
    isLoggedIn: false
  });

  // Current active research parameters
  const [junction, setJunction] = useState<JunctionData>({
    metadata: {
      name: 'Outer Ring Mahatma Crossroad',
      location: 'Central District Quadrant-4',
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      peakHour: '17:00 - 18:00 Peak Period'
    },
    nb: { roadWidth: 7.5, lanes: 2 },
    sb: { roadWidth: 7.5, lanes: 2 },
    eb: { roadWidth: 10.5, lanes: 3 },
    wb: { roadWidth: 10.5, lanes: 3 }
  });

  // Vehicle counts storage (14 Classes)
  const [counts, setCounts] = useState<DirectionCounts>(() => {
    const emptyCounts: DirectionCounts = { nb: {}, sb: {}, eb: {}, wb: {} };
    VECHICLE_TYPES.forEach(v => {
      emptyCounts.nb[v.id] = 0;
      emptyCounts.sb[v.id] = 0;
      emptyCounts.eb[v.id] = 0;
      emptyCounts.wb[v.id] = 0;
    });
    return emptyCounts;
  });

  // Captured visual junction image settings
  const [image, setImage] = useState<JunctionImage>({
    sourceType: 'diagram'
  });

  // Webster lost times parameters
  const [startLostPerPhase, setStartLostPerPhase] = useState<number>(2.0);
  const [allRedTime, setAllRedTime] = useState<number>(2.0);

  // Database of survey logs
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState<string>('welcome');

  // Load history records from localStorage upon startup
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_RECORDS_KEY);
    if (raw) {
      try {
        setHistoryRecords(JSON.parse(raw));
      } catch (err) {
        console.error('Failed to parse storage logs', err);
      }
    }
  }, []);

  // Update theme classes on body element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle saving past records (mirrors Firebase Realtime DB)
  const handleSaveActiveRecord = () => {
    const currentResults = runJunctionAnalysis(
      junction,
      counts,
      { startLostPerPhase, allRedTime }
    );

    const newRecord: HistoryRecord = {
      id: `record_${Date.now()}`,
      userId: session.email,
      savedAt: new Date().toLocaleString(),
      junction,
      counts,
      image,
      results: currentResults
    };

    const updated = [newRecord, ...historyRecords];
    setHistoryRecords(updated);
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(updated));

    setSaveSuccessMessage('Synced with Firebase RT-Database!');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3000);
  };

  // Delete historic document
  const handleDeleteRecord = (id: string) => {
    const filtered = historyRecords.filter(r => r.id !== id);
    setHistoryRecords(filtered);
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(filtered));
  };

  // Restore history record to active design workspace
  const handleLoadRecord = (record: HistoryRecord) => {
    setJunction(record.junction);
    setCounts(record.counts);
    setImage(record.image);
    if (record.results.lostTime) {
      setStartLostPerPhase(record.results.lostTime.perPhaseLost || 2.0);
      setAllRedTime(record.results.lostTime.allRedTime || 2.0);
    }
    setActiveStep('pcu'); // Send to calculations/PCU directly to review
  };

  // Perform analytical evaluations in real time
  const currentResults = runJunctionAnalysis(
    junction,
    counts,
    { startLostPerPhase, allRedTime }
  );

  const startNewSession = (newSession: UserSession) => {
    setSession(newSession);
    setActiveStep('info'); // Forward to geometry input first
  };

  const handleLogout = () => {
    setSession({ email: null, isGuest: false, isLoggedIn: false });
    setActiveStep('welcome');
  };

  // Stepper elements mapping
  const stepsList = [
    { key: 'info', label: '1. Junction Profile', icon: <Compass className="w-4 h-4" /> },
    { key: 'diagram', label: '2. Site Assets', icon: <Layers className="w-4 h-4" /> },
    { key: 'counter', label: '3. Surveyor counter', icon: <Activity className="w-4 h-4" /> },
    { key: 'pcu', label: '4. PCU conversions', icon: <Calculator className="w-4 h-4" /> },
    { key: 'calc', label: '5. Equation Ledger', icon: <Sliders className="w-4 h-4" /> },
    { key: 'sim', label: '6. Active Simulator', icon: <Timer className="w-4 h-4" /> },
    { key: 'charts', label: '7. Analytics Graphs', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'history', label: '8. Records Vault', icon: <History className="w-4 h-4" /> },
    { key: 'reports', label: '9. Dispatch Report', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const getStepIndex = (key: string) => stepsList.findIndex(s => s.key === key);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-350 select-none antialiased flex flex-col font-sans">
      
      {/* Real-time sync and utility header */}
      <header className="sticky top-0 z-35 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between select-none print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] select-none">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
              SmartSignal <span className="text-emerald-500 text-[10px] font-normal ml-2 tracking-widest uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Pro v2.4</span>
            </h1>
            <span className="text-[10px] text-slate-400 -mt-1 font-medium uppercase tracking-wider block">
              Traffic Signal Design & PCU Junction Analysis
            </span>
          </div>
        </div>

        {/* Database cloud status and profile buttons */}
        <div className="flex items-center gap-3">
          {session.isLoggedIn || session.isGuest ? (
            <div className="hidden border border-slate-800 bg-slate-900 p-1 px-2.5 rounded-xl text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 select-none sm:flex shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Realtime Database Synchronized</span>
            </div>
          ) : null}

          {/* Save work to logs drawer */}
          {activeStep !== 'welcome' && (
            <button
              id="top-save-db-button"
              onClick={handleSaveActiveRecord}
              className="px-3.5 py-1.5 text-xs font-extrabold text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Store Run
            </button>
          )}

          {saveSuccessMessage && (
            <span className="text-[10px] text-emerald-450 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg animate-pulse whitespace-nowrap border border-emerald-500/20">
              {saveSuccessMessage}
            </span>
          )}

          {/* Theme custom toggle button */}
          <button
            id="theme-toggler"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 border border-slate-800 bg-slate-900 rounded-xl hover:bg-slate-800 text-slate-400 transition-all cursor-pointer shadow-md"
            title="Toggle Brightness Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Logout if authenticated */}
          {session.isLoggedIn || session.isGuest ? (
            <button
              id="top-logout-btn"
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 rounded-xl transition-all"
              title="End active design session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row relative">
        
        {/* Navigation Rail for engineers (Screens Stepper map) */}
        {activeStep !== 'welcome' && (
          <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800 p-4 shrink-0 overflow-y-auto block select-none bg-slate-950 print:hidden">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1 pb-2 border-b border-slate-800">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-450">
                  W
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Layout</span>
                  <span className="text-xs font-extrabold text-slate-200 block truncate w-32">
                    {junction.metadata.name || 'Untitled junction'}
                  </span>
                </div>
              </div>

              {/* Steps buttons sidebar stack */}
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
                {stepsList.map((st) => {
                  const isActive = activeStep === st.key;
                  return (
                    <button
                      id={`sidebar-step-${st.key}`}
                      key={st.key}
                      onClick={() => setActiveStep(st.key)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap md:whitespace-normal text-left transition-all cursor-pointer w-full ${
                        isActive
                          ? 'bg-emerald-600 text-slate-50 shadow-md shadow-emerald-950/40 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800'
                      }`}
                    >
                      {st.icon}
                      <span className="hidden leading-none sm:inline md:inline">{st.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Dynamic Canvas Area */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              {activeStep === 'welcome' && (
                <WelcomeScreen onStart={startNewSession} />
              )}

              {activeStep === 'info' && (
                <JunctionInfoForm
                  data={junction}
                  onChange={setJunction}
                  onNext={() => setActiveStep('diagram')}
                />
              )}

              {activeStep === 'diagram' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assets Repository Image & Vector Diagram</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Step 2: Upload raw surveillance picture or render blueprint drawing</p>
                    </div>
                  </div>
                  <JunctionDiagramSVG
                    data={junction}
                    imageConfig={image}
                    onImageChange={setImage}
                  />
                  <div className="flex justify-end">
                    <button
                      id="btn-confirm-site-assets"
                      onClick={() => setActiveStep('counter')}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-amber-500/20 active:scale-95 shadow-md flex items-center gap-1.5"
                    >
                      Confirm Site Assets
                      <Activity className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 'counter' && (
                <VehicleEntryCounter
                  counts={counts}
                  onChange={setCounts}
                  onNext={() => setActiveStep('pcu')}
                />
              )}

              {activeStep === 'pcu' && (
                <PCUTableDisplay
                  counts={counts}
                  results={currentResults}
                  onNext={() => setActiveStep('calc')}
                />
              )}

              {activeStep === 'calc' && (
                <CalculationsDashboard
                  junction={junction}
                  counts={counts}
                  results={currentResults}
                  startLostPerPhase={startLostPerPhase}
                  allRedTime={allRedTime}
                  onConfigChange={(lost, red) => {
                    setStartLostPerPhase(lost);
                    setAllRedTime(red);
                  }}
                  onNext={() => setActiveStep('sim')}
                />
              )}

              {activeStep === 'sim' && (
                <LiveSimulationController
                  junction={junction}
                  results={currentResults}
                  onNext={() => setActiveStep('charts')}
                />
              )}

              {activeStep === 'charts' && (
                <AnalyticsCharts
                  counts={counts}
                  results={currentResults}
                  onNext={() => setActiveStep('history')}
                />
              )}

              {activeStep === 'history' && (
                <HistoryAndCompare
                  records={historyRecords}
                  onDeleteRecord={handleDeleteRecord}
                  onLoadRecord={handleLoadRecord}
                  onNext={() => setActiveStep('reports')}
                />
              )}

              {activeStep === 'reports' && (
                <ReportsPrintLayout
                  junction={junction}
                  counts={counts}
                  image={image}
                  results={currentResults}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Elegant footer details */}
      <footer className="py-4 border-t border-slate-200 dark:border-slate-850/60 bg-white dark:bg-slate-900/30 text-center text-[10px] text-slate-400 select-none print:hidden">
        <div>SmartSignal Junction Diagnostic Assessment Platform</div>
        <div className="mt-1 flex items-center justify-center gap-1.5 font-mono">
          <span>• Engine: Webster Peak Split Formula</span>
          <span>• Compliant with IRC Guidelines</span>
          <span>• Local-FS Firebase Schema v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
