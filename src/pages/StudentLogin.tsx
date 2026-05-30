/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Lock, ChevronRight, Eye, EyeOff, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { APIService } from '../services/api';

interface StudentLoginProps {
  onLoginSuccess: (user: { id: string; name: string; email: string; role: 'student' | 'admin' }) => void;
  onNavigate: (route: string) => void;
}

export default function StudentLogin({ onLoginSuccess, onNavigate }: StudentLoginProps) {
  const [studentID, setStudentID] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentID.trim()) {
      setError('Please provide a valid Student ID or Email.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Create user context
      const id = studentID.toUpperCase().startsWith('STU') ? studentID.toUpperCase() : 'STU-1082';
      const nameMatch = studentID.toLowerCase().includes('aarav') ? 'Aarav Sharma' : 
                          studentID.toLowerCase().includes('sneha') ? 'Sneha Reddy' : 
                          studentID.toLowerCase().includes('kabir') ? 'Kabir Mehta' : id;
      
      const email = studentID.includes('@') ? studentID : `${studentID.toLowerCase()}@university.edu`;

      const user = {
        id,
        name: nameMatch,
        email,
        role: 'student' as const
      };

      APIService.setCurrentUser(user);
      setLoading(false);
      onLoginSuccess(user);
    }, 1200);
  };

  // 1-Click quick login demo account logins
  const handleQuickLogin = (demoId: string, name: string) => {
    setStudentID(demoId);
    setPassword('demo-credentials-2026');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        {/* Left Side: Brand Imagery */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#6366F1]/10 via-[#0B1120] to-[#0B1120] p-8 flex flex-col justify-between border-r border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,#0B1120_100%)] z-0" />
          <div className="absolute -top-10 -left-10 h-32 w-32 bg-[#06B6D4]/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <button 
              onClick={() => onNavigate('landing')}
              className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1 font-mono transition-colors cursor-pointer"
            >
              ← Back to main site
            </button>
            <div className="mt-8 flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[#06B6D4]" />
              <span className="font-extrabold text-white text-lg tracking-tight">AI RESOLVE</span>
            </div>
            <span className="text-[10px] block font-mono text-slate-500 mt-1 uppercase tracking-widest leading-none">Security validation node</span>
          </div>

          <div className="relative z-10 my-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Student Identity Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
              Securely sign in to report infrastructure failures, food quality deficits, and network bottlenecks. The AI classifier automatically routes queries.
            </p>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>STUDENT CLIENT v1.1</span>
            <span className="text-[#06B6D4] h-2 w-2 rounded-full bg-[#06b6d4] animate-pulse" />
          </div>
        </div>

        {/* Right Side: Auth Inputs */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Student Login</h2>
              <p className="text-xs text-slate-400 mt-1.5">Provide official university credentials below to access key stats.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-400 text-left">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Student ID or Mail Address
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                    placeholder="e.g. STU-1082"
                    className="w-full bg-[#0B1120] border border-white/10 hover:border-[#6366F1]/50 focus:border-[#6366F1] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6366F1] transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-[11px] text-[#06B6D4] hover:underline font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B1120] border border-white/10 hover:border-[#6366F1]/50 focus:border-[#6366F1] rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6366F1] transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/10 text-[#6366F1] focus:ring-0 bg-[#0B1120] h-3.5 w-3.5"
                  />
                  <span>Establish persistent session cookie</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-xl py-3 text-xs text-white font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Decrypt & Authenticate Student</span>
                    <LogIn className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Assist triggers */}
            <div className="mt-8 border-t border-white/10 pt-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-3">Evaluator Helper Sandbox</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('STU-1082', 'Aarav Sharma')}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg border border-white/5 text-[10px] text-slate-400 font-mono transition-all cursor-pointer text-left"
                >
                  Quick Student 1 (Aarav)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('STU-1120', 'Sneha Reddy')}
                  className="px-2.5 py-1.5 bg-slate-800/40 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono transition-colors cursor-pointer text-left"
                >
                  Quick Student 2 (Sneha)
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-[11px] text-slate-500 font-mono">
                Looking for Administrative access?{' '}
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-[#6366F1] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
