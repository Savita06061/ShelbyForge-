/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Twitter, Github, MessageSquare, Anchor, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-[#030303] text-gray-500 font-sans mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/[0.03]">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <svg 
                className="w-5 h-5 filter drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50 5L90 28.2V71.8L50 95L10 71.8V28.2L50 5Z" stroke="#00F0FF" strokeWidth="3" strokeLinejoin="round" />
                <path d="M30 35H70L30 65H70" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h4 className="font-display font-black text-sm tracking-wider text-white">
                SHELBY<span className="text-shelby-cyan">FORGE</span>
              </h4>
            </div>
            <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
              Decentralized hot storage and verifiable Merkle proof generation registry. Protect your assets with elite cryptographic hashes, certified on the Aptos ledger.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-shelby-cyan animate-pulse" />
              <span>POWERED BY SHELBY HIGH-PERFORMANCE STORAGE</span>
            </div>
          </div>

          {/* Built By Section - HIGHLIGHTED */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-semibold uppercase tracking-widest text-[#00F0FF]">BUILT BY</h5>
            <div className="flex items-center gap-2 text-white">
              <span className="font-mono text-sm font-bold bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-shelby-cyan text-shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                Web3Vibesz0g
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Verifiably forged secure interfaces.</p>
          </div>

          {/* Social Social Links */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-semibold uppercase tracking-widest text-[#B026FF]">COMMUNITY</h5>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors text-shadow"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4 text-gray-400 hover:text-shelby-cyan" />
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                title="Discord"
              >
                <MessageSquare className="w-4 h-4 text-gray-400 hover:text-shelby-cyan" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4 text-gray-400 hover:text-shelby-cyan" />
              </a>
            </div>
            <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Vetted Web3 Node Verified</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© 2026 ShelbyForge. All rights reserved.</p>
          <p className="text-gray-400 bg-white/5 border border-white/5 rounded-full px-3 py-1 font-mono text-[10px] tracking-tight">
            Community Project — Not Officially Affiliated with Aptos or Shelby Inc.
          </p>
        </div>

      </div>
    </footer>
  );
}
