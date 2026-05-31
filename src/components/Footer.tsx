/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Twitter, ShieldCheck, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-[#030303] text-gray-500 font-sans mt-auto">
      <div className="mx-auto max-w-[1550px] px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/[0.03]">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <svg 
                className="w-5 h-5 filter drop-shadow-[0_0_5px_rgba(59,130,246,0.4)]" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50 5L90 28.2V71.8L50 95L10 71.8V28.2L50 5Z" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" />
                <path d="M30 35H70L30 65H70" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
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

          {/* Social Social Links */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-semibold uppercase tracking-widest text-[#6366f1]">TEAM SHELBYFORGE COMMUNITY</h5>
            <div className="flex gap-3">
              <a 
                href="https://x.com/Web3Vibesz0g" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors text-shadow"
                title="X (Twitter) Profile"
              >
                <Twitter className="w-4 h-4 text-gray-400 hover:text-shelby-cyan" />
              </a>
              <a 
                href="https://github.com/Savita06061/ShelbyForge-" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors text-shadow"
                title="GitHub"
              >
                <Github className="w-4 h-4 text-gray-400 hover:text-shelby-cyan" />
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors text-shadow"
                title="Telegram"
              >
                <svg 
                  className="w-4 h-4 text-gray-400 hover:text-shelby-cyan transition-colors" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </a>
            </div>
            <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Vetted Web3 Node Verified</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© 2026 ShelbyForge. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
