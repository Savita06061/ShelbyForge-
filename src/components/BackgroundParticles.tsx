/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function BackgroundParticles() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030303] pointer-events-none">
      {/* Dynamic Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-65" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/70 to-[#030303]" />

      {/* Futuristic Vector Gradients / Glowing Orbs */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-shelby-cyan/15 to-[#B026FF]/5 blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -60, 50, 0],
          y: [0, 80, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-[#B026FF]/15 to-shelby-cyan/5 blur-[120px]"
      />

      {/* Cyber Diagonal Light Rays */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_50%_120%,rgba(0,240,255,0.1),transparent_45%)]" />

      {/* Neon Micro Nodes / Static Background Detail */}
      <div className="absolute inset-0 cyber-dot-pattern opacity-40" />

      {/* Micro Glow points */}
      <div className="absolute top-[25%] left-[15%] w-1 h-1 rounded-full bg-shelby-cyan shadow-[0_0_8px_4px_rgba(0,240,255,0.4)] animate-pulse-slow" />
      <div className="absolute top-[65%] right-[20%] w-1.5 h-1.5 rounded-full bg-shelby-purple shadow-[0_0_10px_5px_rgba(176,38,255,0.4)] animate-pulse-slow" />
      <div className="absolute bottom-[30%] left-[45%] w-1 h-1 rounded-full bg-shelby-cyan shadow-[0_0_8px_4px_rgba(0,240,255,0.3)] animate-pulse" />
    </div>
  );
}
