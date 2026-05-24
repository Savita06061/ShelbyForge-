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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm glass-panel-neon rounded-2xl p-6 text-gray-100">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-shelby-cyan via-shelby-purple to-shelby-cyan" />
            
            <h3 className="font-display text-lg font-bold text-white mb-2">Connect to Aptos Network</h3>
            <p className="text-xs text-gray-400 mb-5">Select a wallet provider to store cryptographic Merkle proofs verified on Aptos Testnet chain.</p>

            <div className="space-y-3">
              {/* Option 1: Petra Wallet Extension */}
              <button
                onClick={() => onConnectWallet('petra')}
                className="w-full p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-shelby-cyan/30 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="#00F0FF" strokeWidth="2" fill="none" />
                      <path d="M12 7v10M7 12h10" stroke="#B026FF" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold text-white">Petra Wallet</h5>
                    <p className="text-[10px] text-gray-500">Official Aptos Browser extension</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-shelby-cyan transition-colors" />
              </button>

              {/* Option 2: Burner Forge Ephemeral Wallet */}
              <button
                onClick={() => onConnectWallet('burner')}
                className="w-full p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-shelby-purple/30 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-shelby-purple/10 text-shelby-purple">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="#B026FF" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold text-white">Shelby Ephemeral Lock</h5>
                    <p className="text-[10px] text-gray-500">Instant in-browser burner. No extension required</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-shelby-purple/10 border border-shelby-purple/30 rounded px-1.5 py-0.5">
                  <span className="text-[8px] font-bold font-mono text-shelby-purple uppercase">PREVIEW OK</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowWalletModal(false)}
              className="mt-6 w-full text-center text-xs text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
