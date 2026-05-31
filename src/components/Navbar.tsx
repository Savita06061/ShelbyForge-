/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletState } from '../types';
import { motion } from 'motion/react';
import { Wallet, LogOut, ChevronRight, Check, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  onConnectWallet: (type: 'petra' | 'burner') => void;
  onDisconnectWallet: () => void;
  currentView: 'landing' | 'dashboard';
  setView: (view: 'landing' | 'dashboard') => void;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Navbar({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  currentView,
  setView,
  showWalletModal,
  setShowWalletModal,
  theme,
  onToggleTheme
}: NavbarProps) {
  const { wallets } = useWallet();
  
  // Format long wallet address beautifully
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const [activeTab, setActiveTab] = useState<'real' | 'sync' | 'burner'>('real');
  const [isPetraInjected, setIsPetraInjected] = useState(false);

  React.useEffect(() => {
    const checkInjection = () => {
      const injected = wallets.length > 0 || (typeof window !== 'undefined' && (
        (window as any).petra !== undefined ||
        (window as any).aptos !== undefined ||
        (window as any).martian !== undefined ||
        (window as any).pontem !== undefined ||
        (window as any).rise !== undefined
      ));
      setIsPetraInjected(injected);
    };
    checkInjection();

    const timer = setTimeout(checkInjection, 300);
    const fallbackTimer = setTimeout(checkInjection, 1200);

    window.addEventListener("aptosChanged", checkInjection);
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      window.removeEventListener("aptosChanged", checkInjection);
    };
  }, [wallets]);

  let isFrame = false;
  try {
    isFrame = typeof window !== 'undefined' && window.self !== window.top;
  } catch (e) {
    isFrame = true;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.04] bg-[#030303]/60 backdrop-blur-md">
      <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8">
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
              <span className="text-[10px] font-mono font-medium tracking-wider text-[#00F0FF]">SHELBY DEVNET</span>
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
                <div className="hidden lg:flex items-center gap-2 border border-white/5 bg-black/20 rounded-xl px-2.5 py-1 text-right font-mono text-[10px]">
                  <div className="flex flex-col pr-2 border-r border-white/10">
                    <span className="text-gray-500 text-[8px] uppercase tracking-wider">SHEUSD</span>
                    <span className="font-bold text-shelby-purple">
                      {(wallet.shelbyUsdBalance || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-col pl-1">
                    <span className="text-gray-500 text-[8px] uppercase tracking-wider">APTOS</span>
                    <span className="font-bold text-shelby-cyan">
                      {(wallet.balance || 0).toFixed(2)}
                    </span>
                  </div>
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

            {/* Custom Squirclish Premium Theme Toggle (inspired by user mockup) */}
            <button
              onClick={onToggleTheme}
              className="relative p-2 rounded-2xl border-2 border-slate-300 bg-[#0c141d] hover:bg-[#16222f] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)] w-10 h-10 min-w-10 min-h-10 text-[#00F0FF] group"
              id="theme-brightness-toggle"
              title={theme === 'dark' ? "Switch to Bright Mode" : "Switch to Dark Mode"}
            >
              <Sun className="w-5 h-5 text-[#00F0FF] group-hover:rotate-45 transition-transform duration-500 filter drop-shadow-[0_0_4px_rgba(0,240,255,0.7)]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Connection Selection Modal Overlay */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel-neon rounded-2xl p-6 text-gray-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-shelby-cyan via-shelby-purple to-shelby-cyan" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-shelby-cyan animate-pulse" />
                  Connect Aptos Ledger
                </h3>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Secure Crypt Proof Gateway</span>
              </div>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="p-1 px-2.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-mono font-medium border border-white/5 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Seamless Sub-Tabs Selector */}
            <div className="flex border border-white/5 mb-5 p-1 bg-black/45 rounded-xl gap-1">
              <button 
                onClick={() => setActiveTab('real')}
                className={`flex-1 py-2 text-[11px] font-bold font-display rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'real' 
                    ? 'bg-gradient-to-r from-shelby-cyan/15 to-shelby-purple/15 text-white border border-shelby-cyan/30 shadow-[0_0_8px_rgba(0,240,255,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <span>Petra Extension</span>
              </button>
              <button 
                onClick={() => setActiveTab('sync')}
                className={`flex-1 py-2 text-[11px] font-bold font-display rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'sync' 
                    ? 'bg-gradient-to-r from-shelby-cyan/15 to-shelby-purple/15 text-white border border-shelby-cyan/30 shadow-[0_0_8px_rgba(0,240,255,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <span>Manual Sync</span>
              </button>
              <button 
                onClick={() => setActiveTab('burner')}
                className={`flex-1 py-2 text-[11px] font-bold font-display rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'burner' 
                    ? 'bg-gradient-to-r from-shelby-cyan/15 to-shelby-purple/15 text-white border border-shelby-cyan/30 shadow-[0_0_8px_rgba(0,240,255,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <span>Sandbox Sim</span>
              </button>
            </div>

            {/* Modal Body with internal scrolling protection */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4 scrollbar-thin max-h-[60vh]">
              
              {/* Tab 1: Real Petra Wallet */}
              {activeTab === 'real' && (
                <div className="space-y-4">
                  {/* Extension State diagnostics */}
                  {isPetraInjected ? (
                    <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl text-center text-xs">
                      <span className="text-emerald-400 font-bold font-mono tracking-wider flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        🟢 APTOS WALLET DETECTED
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">Ready for on-chain cryptographic ledger signatures via your extension.</p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-500/[0.03] border border-amber-500/20 rounded-xl text-xs space-y-2">
                      <span className="text-amber-400 font-bold font-mono tracking-wider flex items-center gap-1.5">
                        ⚠️ WALLET EXTENSION NOT DETECTED
                      </span>
                      <p className="text-[10.5px] text-gray-300 leading-relaxed">
                        <strong>English:</strong> Petra or other Aptos wallet extensions were not detected or are locked. Unlock your extension, or switch to the <strong>Manual Sync</strong> or <strong>Sandbox Sim</strong> tabs above!
                      </p>
                      <p className="text-[10.5px] text-gray-400 leading-relaxed">
                        <strong>Hindi:</strong> Petra ya Aptos wallet extension active ya unlocked nahi mila. Extension unlock karein ya uper <strong>Manual Sync</strong> ya <strong>Sandbox Sim</strong> option se bina extension ke test karein!
                      </p>
                    </div>
                  )}

                  {/* Prime Wallet Button */}
                  <button
                    onClick={() => onConnectWallet('petra')}
                    className="w-full p-4 rounded-xl border border-shelby-cyan/30 bg-white/[0.02] hover:bg-white/5 hover:border-shelby-cyan/60 flex items-center justify-between text-left transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-1 bg-shelby-cyan/10 rounded-bl-lg">
                      <span className="text-[7px] font-bold font-mono text-shelby-cyan tracking-wider">AIP-62 STD</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/15 transition-all">
                        <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" stroke="#00F0FF" strokeWidth="2" fill="none" />
                          <path d="M12 7v10M7 12h10" stroke="#B026FF" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-display text-sm font-bold text-white group-hover:text-shelby-cyan transition-colors">
                          Connect Petra Extension
                        </h5>
                        <p className="text-[10px] text-gray-400 leading-relaxed">Official browser-secured signer key</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-shelby-cyan transition-colors" />
                  </button>

                  {/* Sandboxed / Frame alert and manual tab recommendation */}
                  {isFrame && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-shelby-cyan/10 to-transparent border border-shelby-cyan/20 text-xs">
                      <span className="font-bold text-shelby-cyan block mb-1">🚨 Sandbox Bypasser Available</span>
                      <p className="text-gray-300 text-[10px] leading-relaxed">
                        Currently inside the AI Studio review iframe. For the absolute 100% flawless live Petra extension flow, use the independent tab bypass:
                      </p>
                      <a 
                        href={window.location.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-shelby-cyan text-black hover:bg-white text-center font-display font-bold text-[10px] block transition-all shadow-md cursor-pointer"
                      >
                        ↗️ OPEN IN NEW TAB (REAL CONNECT BYPASS)
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Custom Aptos Address Sync */}
              {activeTab === 'sync' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono font-bold tracking-widest text-shelby-cyan uppercase">
                        Address Synchronization
                      </label>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-shelby-cyan/10 text-shelby-cyan font-mono border border-shelby-cyan/20">
                        DIRECT LINK
                      </span>
                    </div>
                    
                    <p className="text-[10.5px] text-gray-400 leading-relaxed">
                      English: Connect any Aptos Hex address manually to load your test portfolio. Useful when extensions are blocked by iframe policies.
                    </p>
                    <p className="text-[10.5px] text-gray-500 leading-relaxed">
                      Hindi: Apna real external Aptos address paste karke directly link karein. Agar extension inject nahi ho raha to ye perfect option hai.
                    </p>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const addrInput = formData.get('aptosAddress') as string;
                        if (addrInput && addrInput.trim().startsWith('0x') && addrInput.trim().length >= 40) {
                          (window as any).__customAptosAddress = addrInput.trim();
                          onConnectWallet('burner'); // triggers verification
                        } else {
                          alert('Please enter a valid Hex public address starting with 0x (40+ chars)');
                        }
                      }}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        name="aptosAddress"
                        type="text"
                        required
                        placeholder="Paste Aptos address (e.g. 0x89c...)"
                        className="flex-1 bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-shelby-cyan/50 focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-500"
                      />
                      <button
                        type="submit"
                        className="bg-shelby-cyan/10 hover:bg-shelby-cyan/20 border border-shelby-cyan/30 text-xs font-bold font-display px-4 py-2 rounded-lg text-shelby-cyan transition-all cursor-pointer"
                      >
                        Sync
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 3: Burner Ephemeral Wallet */}
              {activeTab === 'burner' && (
                <div className="space-y-4">
                  <div className="p-3 bg-shelby-purple/[0.03] border border-shelby-purple/25 rounded-xl text-xs space-y-2 leading-relaxed">
                    <span className="text-shelby-purple font-bold font-mono tracking-wider block">⚡ INSTANT SANDBOX PLAYGROUND</span>
                    <p className="text-gray-300 text-[10px]">
                      Generate an isolated local in-browser cryptographic wallet to simulate proofs, faucet claims, and files registration without installing extensions.
                    </p>
                  </div>

                  <button
                    onClick={() => onConnectWallet('burner')}
                    className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-shelby-purple/40 flex items-center justify-between text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-shelby-purple/10 text-shelby-purple group-hover:bg-shelby-purple/15 transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="#B026FF" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-display text-sm font-bold text-white group-hover:text-shelby-purple transition-colors">
                          Generate Ephemeral Lock
                        </h5>
                        <p className="text-[10px] text-gray-400">Instantly test all actions in the live sandbox</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-shelby-purple/10 border border-shelby-purple/30 rounded px-1.5 py-0.5">
                      <span className="text-[8px] font-bold font-mono text-shelby-purple">SIMULATOR</span>
                    </div>
                  </button>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-gray-500 text-center flex items-center justify-center gap-1">
              <span>🔒 Direct transactions security verified via standard Aptos RPC.</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
