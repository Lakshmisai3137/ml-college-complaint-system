/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function GridScanBackground() {
  return (
    <div id="grid-scan-container" className="fixed inset-0 -z-50 overflow-hidden bg-[#0B1120]">
      {/* Grid Scan Background Effect */}
      <div 
        id="cyber-grid-mesh"
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div 
        id="cyber-glow-overlay"
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
        }}
      />

      {/* Cybernetic code grid scan line element */}
      <motion.div
        id="laser-scan-bar"
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#06B6D4]/50 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)] opacity-70"
        initial={{ top: '-5%' }}
        animate={{ top: '105%' }}
        transition={{
          duration: 9,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      
      {/* Secondary micro scanning line for overlapping complexity */}
      <motion.div
        id="laser-secondary-scan-bar"
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent opacity-40"
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{
          duration: 15,
          ease: 'linear',
          repeat: Infinity,
          delay: 4
        }}
      />
    </div>
  );
}
