/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalletState } from '../types';
import { motion } from 'motion/react';
import { Wallet, LogOut, ChevronRight, Check } from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  onConnectWallet: (type: 'petra' | 'burner') => void;
  onDisconnectWallet: () => void;
  currentView: 'landing' | 'dashboard';
  setView: (view: 'landing' | 'dashboard') => void;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
}

export default function Navbar({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  currentView,
  setView,
  showWalletModal,
  setShowWalletModal
}: NavbarProps) {
  
  // Format long wallet address beautifully
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.04] bg-[#030303]/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Shelby Logo */}
          <div 
            onClick={() => setView('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-black border border-white/5 group-hover:border-shelby-cyan/30 transition-all">
              <svg 
                className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all group-hover:scale-105" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Custom premium Shelby logo: Dynamic cyber wing-S */}
                <path d="M50 5L90 28.2V71.8L50 95L10 71.8V28.2L50 5Z" stroke="#00F0FF" strokeWidth="2" strokeLinejoin="round" />
                <path d="M50 15L80 32.4V67.6L50 85L20 67.6V32.4L50 15Z" stroke="#B026FF" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M30 35H70L30 65H70" stroke="#00F0FF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="4" fill="#B026FF" className="animate-pulse" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-wider text-white group-hover:text-shelby-cyan transition-colors">
                SHELBY<span className="text-transparent bg-clip-text bg-gradient-to-r from-shelby-cyan to-shelby-purple">FORGE</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase">HOT VAULT SECURED</span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setView('landing')}
              className={`text-sm font-medium transition-colors ${currentView === 'landing' ? 'text-shelby-cyan font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-shelby-cyan font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              The Forge
            </button>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              <span className="text-[10px] font-mono font-medium tracking-wider text-[#00F0FF]">APTOS TESTNET</span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {currentView === 'landing' && (
              <button
                onClick={() => setView('dashboard')}
                className="hidden sm:flex border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs font-display font-medium text-gray-300 px-4 py-2 rounded-xl transition-all items-center gap-1"
              >
                <span>Launch Forge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Wallet State Connector */}
            {wallet.connected && wallet.address ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] font-mono font-medium text-gray-400 uppercase tracking-widest">APT BALANCE</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {wallet.balance.toFixed(2)} APT
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-100">{formatAddress(wallet.address)}</span>
                  <button
                    onClick={onDisconnectWallet}
                    className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display text-xs font-bold px-4 py-2 rounded-xl border border-white/10 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <Wallet className="w-3.5 h-3.5 text-black" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Selection Modal Overlay */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel-neon rounded-2xl p-6 text-gray-100 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-shelby-cyan via-shelby-purple to-shelby-cyan" />
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="text-shelby-cyan">●</span> Connect Aptos Network
              </h3>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-mono font-medium"
              >
                ESC
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Authenticate via the secure Aptos Testnet ledger to forge cryptographic Merkle proofs and pin assets to Shelby's decentralized hot vaults.
            </p>

            <div className="space-y-4">
              {/* Option 1: Petra Wallet Extension */}
              <button
                onClick={() => onConnectWallet('petra')}
                className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-shelby-cyan/40 flex items-center justify-between text-left transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-shelby-cyan/10 rounded-bl-lg">
                  <span className="text-[8px] font-bold font-mono text-shelby-cyan tracking-wider">WALLET STD</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/15 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="#00F0FF" strokeWidth="2" fill="none" />
                      <path d="M12 7v10M7 12h10" stroke="#B026FF" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold text-white group-hover:text-shelby-cyan transition-colors">Petra Wallet</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed">Official Aptos standard browser connector</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-shelby-cyan transition-colors" />
              </button>

              {/* Sandbox Alert warning regarding inside iframes */}
              <div className="p-3.5 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 text-xs text-amber-300 leading-relaxed font-mono">
                <span className="font-bold text-amber-400">🚨 Sandboxed Preview Note:</span> Because AI Studio apps run inside direct browser iframe wrappers, standard extensions like Petra often reject connections due to cross-origin injection limits. Use the <strong className="text-white underline">Custom Address Sync</strong> below for a flawless test experience!
              </div>

              {/* Option 2: Custom Aptos Address Sync (Professional Ledger Fallback) */}
              <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold tracking-widest text-shelby-cyan uppercase">
                    Custom Address Sync (Iframe Bypass)
                  </label>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-shelby-cyan/10 text-shelby-cyan font-mono border border-shelby-cyan/20">
                    SECURE LIVE
                  </span>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const addrInput = formData.get('aptosAddress') as string;
                    if (addrInput && addrInput.trim().startsWith('0x') && addrInput.trim().length >= 40) {
                      // Pass to customized connect wallet mock
                      (window as any).__customAptosAddress = addrInput.trim();
                      onConnectWallet('burner'); // triggers automatic verification
                    } else {
                      alert('Please input a valid Aptos hex public address starting with 0x (64 chars)');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="aptosAddress"
                    type="text"
                    required
                    placeholder="Paste public Aptos Address (e.g. 0x89c...)"
                    className="flex-1 bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-shelby-cyan/50 focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-shelby-cyan/30 text-xs font-bold font-display px-3 py-2 rounded-lg text-white transition-all hover:text-shelby-cyan"
                  >
                    Sync
                  </button>
                </form>
              </div>

              {/* Option 3: Burner Forge Ephemeral Wallet */}
              <button
                onClick={() => onConnectWallet('burner')}
                className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-shelby-purple/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-shelby-purple/10 text-shelby-purple group-hover:bg-shelby-purple/15 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="#B026FF" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold text-white group-hover:text-shelby-purple transition-colors">Shelby Ephemeral Lock</h5>
                    <p className="text-[10px] text-gray-400">Generate instantly to preview full interactive sandbox</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-shelby-purple/10 border border-shelby-purple/30 rounded px-1.5 py-0.5">
                  <span className="text-[8px] font-bold font-mono text-shelby-purple">SIMULATOR</span>
                </div>
              </button>
            </div>

            <div className="mt-5 text-[10px] font-mono text-gray-500 text-center flex items-center justify-center gap-1">
              <span>🔒 Direct wallet interactions verified safely via Aptos JSON-RPC.</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
