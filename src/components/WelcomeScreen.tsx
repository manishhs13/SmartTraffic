/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrafficCone, User, Shield, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { UserSession } from '../types';

interface WelcomeScreenProps {
  onStart: (session: UserSession) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [tab, setTab] = useState<'login' | 'signup' | 'guest'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      if (!email || !password) {
        setMessage('Please enter your email and password');
        return;
      }
      setMessage(null);
      onStart({
        email,
        isGuest: false,
        isLoggedIn: true,
        name: email.split('@')[0],
      });
    } else if (tab === 'signup') {
      if (!email || !password || !name) {
        setMessage('All fields are required for sign up');
        return;
      }
      setMessage(null);
      onStart({
        email,
        isGuest: false,
        isLoggedIn: true,
        name,
      });
    }
  };

  const handleGuestStart = () => {
    onStart({
      email: null,
      isGuest: true,
      isLoggedIn: false,
      name: 'Guest Engineer',
    });
  };

  return (
    <div id="welcome-screen-wrapper" className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center mb-8"
      >
        <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 items-center justify-center font-black text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4 select-none">
          S
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text">
          SmartSignal <span className="text-emerald-450 text-sm font-normal tracking-widest uppercase block mt-1">PRO VERSION 2.4</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          PCU Analysis, Webster Cycle Configuration, Phase Simulations, and Level of Service (LOS) Diagnostics.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden bento-card shadow-slate-950/80"
      >
        {/* MD3 Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl mb-6 border border-slate-800/60">
          <button
            id="tab-login"
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            onClick={() => { setTab('signup'); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              tab === 'signup'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            id="tab-guest"
            onClick={() => { setTab('guest'); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              tab === 'guest'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest Sandbox
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@traffic-agency.gov"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Access Code
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {message && (
                <div className="text-xs text-red-400 font-medium py-1">
                  {message}
                </div>
              )}

              <button
                id="btn-login-submit"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow shadow-emerald-950/40 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                Sign In to Database
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {tab === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Civil Engineer Name"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@traffic-agency.gov"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Choose Access Pin
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {message && (
                <div className="text-xs text-red-400 font-medium py-1">
                  {message}
                </div>
              )}

              <button
                id="btn-signup-submit"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow shadow-emerald-950/40 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                Create Engineering Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {tab === 'guest' && (
            <motion.div
              key="guest"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4 text-xs text-slate-300 flex gap-3">
                <Shield className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-0.5 text-emerald-400">Guest Survey Sandbox</h4>
                  Mock Firebase storage and state tracking is fully configured. All calculations, diagrams, live countdown controllers, and printable reports work instantaneously without needing standard login credentials.
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-time PCU / Webster calculations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Dynamic SVG junction graphics drawer</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Live visual signal sequence emulator</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Interactive statistics with automated records</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-guest-submit"
                  onClick={handleGuestStart}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm tracking-wide shadow-md shadow-emerald-500/10 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  Start New Traffic Survey
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
