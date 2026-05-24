/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, BrainCircuit, HardDrive, Key, ChevronRight, Cpu, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { WalletState } from '../types';

interface LandingViewProps {
  wallet: WalletState;
  setView: (view: 'landing' | 'dashboard') => void;
  setShowWalletModal: (show: boolean) => void;
}

export default function LandingView({ wallet, setView, setShowWalletModal }: LandingViewProps) {
  
  // Staggered motion presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-shelby-cyan" />,
      title: "Verifiable Cryptography",
      desc: "Perform secure browser-side computations to generate SHA-256 integrity trees. Your raw files never leave your system unhashed."
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-shelby-purple" />,
      title: "Aptos Testnet Trust Anchor",
      desc: "Register Merkle root fingerprints directly on the secure Aptos blockchain. Create an unalterable timestamp of your data's existence."
    },
    {
      icon: <HardDrive className="w-6 h-6 text-shelby-cyan" />,
      title: "Shelby High-Performance Hot Vault",
      desc: "Store your encrypted assets on Shelby's lightning-fast decentralized nodes with redundant, audit-ready data storage systems."
    },
    {
      icon: <Key className="w-6 h-6 text-shelby-purple" />,
      title: "Absolute Owner Control",
      desc: "Instant public-private searchability toggle. Secure decentralized share links with cryptographic validation parameters."
    }
  ];

  return (
    <div className="relative z-10 font-sans text-gray-200">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Subtle Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/10 mb-6 text-shadow"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-shelby-cyan animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-shadow text-gray-400 uppercase">
            Shelby Ecosystem • Early Developer Access
          </span>
        </motion.div>

        {/* Cinematic Main Heading */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.h1 
            variants={itemVariants} 
            className="font-display text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-none text-white"
          >
            SHELBY<span className="text-transparent bg-clip-text bg-gradient-to-r from-shelby-cyan to-shelby-purple">FORGE</span>
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="text-lg sm:text-2xl text-gray-400 font-display font-medium max-w-3xl mx-auto leading-relaxed"
          >
            "Forge Your Verifiable Storage • Powered by Shelby + Aptos"
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            Forge Secure. Prove Immutable. Access Instantly. Generate client-side cryptographic hashes, pin Merkle trees on Aptos, and store on Shelby's elite decentralized server networks.
          </motion.p>
        </motion.div>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm"
        >
          {wallet.connected ? (
            <button
              onClick={() => setView('dashboard')}
              className="w-full sm:w-auto bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display font-bold text-sm px-8 py-4 rounded-2xl border border-white/10 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,240,255,0.3)]"
            >
              <span>Enter The Forge</span>
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowWalletModal(true)}
                className="w-full bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display font-bold text-sm px-6 py-4 rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)]"
              >
                <span>Connect Petra Wallet</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>

              <button
                onClick={() => setView('dashboard')}
                className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/5 active:bg-white/[0.01] hover:border-white/20 text-white font-display font-bold text-sm px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Simulator</span>
              </button>
            </>
          )}
        </motion.div>

        {/* Quick ecosystem taglines */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-shelby-cyan" /> Client-Side Proof Computations
          </span>
          <span className="hidden sm:inline w-1 h-1 bg-white/20 rounded-full" />
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-shelby-purple" /> 0.00142 APT average block gas
          </span>
          <span className="hidden sm:inline w-1 h-1 bg-white/20 rounded-full" />
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-shelby-cyan" /> Shelby High-Response Node Pinning
          </span>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION (GRID) */}
      <section className="py-16 border-t border-b border-white/[0.03] bg-black/[0.15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Decentralized Security Redefined
            </h2>
            <p className="text-sm text-gray-400">
              By combining sub-millisecond local hash generation with absolute L1 validation and Shelby robust replication, ShelbyForge sets a premium benchmark for secure static file storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl glass-panel hover:border-white/10 transition-all flex flex-col justify-between group cursor-default"
              >
                <div>
                  <div className="p-3 w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-shelby-cyan/30 transition-colors mb-5">
                    {feat.icon}
                  </div>
                  <h4 className="font-display text-lg font-bold text-white mb-2 group-hover:text-shelby-cyan transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-end">
                  <span className="text-[10px] font-mono font-medium uppercase text-gray-600 group-hover:text-shelby-purple transition-colors flex items-center gap-1">
                    Node Pinning <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. DYNAMIC METRIC & VALUE PROPOSITION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-2.5 py-1 rounded bg-shelby-purple/10 border border-shelby-purple/30 font-mono text-[9px] font-bold text-shelby-purple uppercase tracking-wider">
              High-Perf Hardware Engine
            </div>
            
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              Powered by Shelby’s Verified Storage Networks
            </h3>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Standard cloud storage uses centralized authentication databases, creating high exposure risks. ShelbyForge stores records on decentralized cryptographic nodes, registered permanently onto the Aptos ledger.
            </p>

            <ul className="space-y-3.5 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">✔</span>
                <span>Fully decentralized, censorship-resistant server mesh.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">✔</span>
                <span>Zero trust storage validation using zero-knowledge Merkle leaf proofs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">✔</span>
                <span>Redundant multi-node hot replication with active checksum nodes.</span>
              </li>
            </ul>

            <div className="pt-4">
              <button
                onClick={() => setView('dashboard')}
                className="bg-white/5 hover:bg-white/10 text-white font-display text-xs font-bold px-5 py-3 rounded-xl border border-white/15 hover:border-white/20 transition-all flex items-center gap-2"
              >
                <span>Demo Interactive Vault</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Vault Dashboard Teaser */}
          <div className="lg:col-span-7 p-1 rounded-3xl bg-gradient-to-br from-shelby-cyan/15 to-shelby-purple/15 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 z-10">
              <div className="flex items-center gap-1 bg-[#09090D]/80 border border-white/10 rounded-full px-2 py-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-emerald-400 text-shadow uppercase tracking-widest">LIVE APLET PREVIEW</span>
              </div>
            </div>

            <div className="glass-panel-neon rounded-[22px] p-6 space-y-4">
              {/* Fake top app bar */}
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                  shelby-node://ledger-verify-v2
                </div>
              </div>

              {/* Fake stats */}
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                  <p className="text-[9px] font-mono text-gray-500 uppercase">SHA-256 Engine</p>
                  <p className="text-sm font-mono font-bold text-shelby-cyan mt-1">Active</p>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                  <p className="text-[9px] font-mono text-gray-500 uppercase">Avg Proof Speed</p>
                  <p className="text-sm font-mono font-bold text-white mt-1">4.2 ms</p>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                  <p className="text-[9px] font-mono text-gray-500 uppercase">Node Pin Index</p>
                  <p className="text-sm font-mono font-bold text-shelby-purple mt-1">98.9%</p>
                </div>
              </div>

              {/* Fake Vault Table */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-500 font-mono tracking-widest px-2 uppercase">
                  <span>File Secure Fingerprint</span>
                  <span>Aptos Status</span>
                </div>
                
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-shelby-cyan/10 text-shelby-cyan text-[10px] font-mono font-bold">PDF</span>
                    <span className="max-w-[120px] sm:max-w-none truncate font-medium text-white">compliance_v4_signed.pdf</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                    VERIFIED ON-CHAIN
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-shelby-purple/10 text-shelby-purple text-[10px] font-mono font-bold">ZIP</span>
                    <span className="max-w-[120px] sm:max-w-none truncate font-medium text-white">alpha_core_release.zip</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                    VERIFIED ON-CHAIN
                  </span>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="pt-2 text-[10px] font-mono text-gray-500 flex justify-between items-center">
                <span>Decentralized Proof Anchor</span>
                <span className="text-shelby-cyan hover:underline cursor-pointer flex items-center gap-1">
                  Launch ShelbyForge <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
