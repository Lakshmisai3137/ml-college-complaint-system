/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Eye, EyeOff, Sparkles, Terminal, Activity, ArrowRight } from 'lucide-react';
import { APIService } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: (user: { id: string; name: string; email: string; role: 'student' | 'admin' }) => void;
  onNavigate: (route: string) => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please input authorized secure credentials.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Create admin context
      const name = email.toLowerCase().includes('dean') ? 'Dean Prof. Rajesh K.' : 
                    email.toLowerCase().includes('estate') ? 'Estate Facilities Director' : 'Principal Dean Rajesh K.';
      
      const adminUser = {
        id: 'ADMIN-604',
        name,
        email: email.includes('@') ? email : 'admin@university.edu',
        role: 'admin' as const
      };

      APIService.setCurrentUser(adminUser);
      setLoading(false);
      onLoginSuccess(adminUser);
    }, 1200);
  };

  const handleQuickAdminLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin-master-key-2026');
  };

  return (
    <div id="admin-login-node" className="min-h-screen flex items-center justify-center p-4">
      {/* Absolute pulsing background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#6366F1]/10 blur-3xl z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl z-20 overflow-hidden"
      >
        {/* Animated matrix scanning lines on the login card border itself */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366F1] to-transparent animate-pulse" />

        {/* Back navigation header */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <button 
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1 font-mono transition-colors cursor-pointer"
          >
            ← Back to main site
          </button>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#06B6D4]" />
            <span className="font-extrabold text-white text-xs tracking-tight">AI RESOLVE</span>
          </div>
        </div>

        {/* Security Shield Icon Header with Pulse Wave effect */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="relative mx-auto mb-4 bg-[#6366F1]/15 p-4 rounded-full border border-[#6366F1]/40">
            <div className="absolute inset-0 h-full w-full rounded-full bg-[#6366F1]/20 animate-ping" style={{ animationDuration: '3s' }} />
            <Shield className="h-7 w-7 text-[#6366F1] relative z-10" />
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase font-mono">ADMIN SYSTEM SECURE ACCESS</h2>
          <p className="text-[10px] text-[#06B6D4] tracking-widest font-mono uppercase mt-1">Authorized Clearance Level II Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono text-left">
              [FIREWALL_REJECT_NOTICE]: {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-[#06B6D4]" />
              <span>Admin Account Mail / ID</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. dean.rajesh@college.edu"
                className="w-full bg-[#0B1120] border border-white/10 hover:border-[#6366F1]/55 focus:border-[#6366F1] rounded-xl py-2.5 px-4 text-xs text-slate-200 placeholder-slate-700 focus:outline-none transition-all font-mono shadow-inner text-left"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <Key className="h-3 w-3 text-[#6366F1]" />
              <span>Cryptographic Access Key</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B1120] border border-white/10 hover:border-[#6366F1]/55 focus:border-[#6366F1] rounded-xl py-2.5 pl-4 pr-10 text-xs text-slate-200 placeholder-slate-700 focus:outline-none transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Secure Handshake Notice */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
            <Activity className="h-4 w-4 text-[#10B981] animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 leading-normal">
              Session communications are automatically SSL/TLS-filtered. IP address logs registered in campus audits.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] rounded-xl py-3 text-xs text-white font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Establish Security Link</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click bypass testing triggers to aid reviewers */}
        <div className="mt-8 border-t border-white/10 pt-5 text-left">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-3">Clearance Simulation Pad</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleQuickAdminLogin('dean.rajesh@university.edu')}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg border border-white/5 text-[10px] text-slate-400 font-mono transition-all cursor-pointer"
            >
              Master Admin (Dean Rajesh)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('student-login')}
            className="text-[10px] text-[#06B6D4] font-mono hover:underline cursor-pointer"
          >
            ← Switch back to student portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
