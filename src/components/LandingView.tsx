/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, BrainCircuit, HardDrive, Key, ChevronRight, Cpu, 
  ArrowUpRight, Zap, RefreshCw, Server, Coins, Database, Check, Clock, Play, Pause, Activity
} from 'lucide-react';
import { WalletState } from '../types';
import { calculateFileHash } from '../utils/crypto';

interface LandingViewProps {
  wallet: WalletState;
  setView: (view: 'landing' | 'dashboard') => void;
  setShowWalletModal: (show: boolean) => void;
}

interface SimulatedTx {
  id: string;
  timestamp: string;
  type: 'BLOCK' | 'REGISTRY' | 'FAUCET' | 'LEASE' | 'SYNC';
  address: string;
  details: string;
  status: 'CONFIRMED' | 'SIGNING';
  gas: string;
}

export default function LandingView({ wallet, setView, setShowWalletModal }: LandingViewProps) {
  
  // ------------------ LIVE TELEMETRY STATE ------------------
  const [blockHeight, setBlockHeight] = useState(48392102);
  const [tps, setTps] = useState(14.8);
  const [activeNodes, setActiveNodes] = useState(128);
  const [gasPrice, setGasPrice] = useState(0.00142);
  const [networkHeartbeats, setNetworkHeartbeats] = useState({
    usEast: 12,
    euCentral: 24,
    asiaPacific: 45
  });

  // ------------------ TRANSACTION EXPLORER CONSOLE State ------------------
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [simulatedTxs, setSimulatedTxs] = useState<SimulatedTx[]>([
    {
      id: "tx-init-1",
      timestamp: new Date(Date.now() - 4000).toLocaleTimeString(),
      type: "SYNC",
      address: "0x89ca...f89c",
      details: "Validator sync with Aptos test-endpoint completed",
      status: "CONFIRMED",
      gas: "0.00002"
    },
    {
      id: "tx-init-2",
      timestamp: new Date(Date.now() - 3200).toLocaleTimeString(),
      type: "REGISTRY",
      address: "0xfabc...02ef",
      details: "Merkle Root 0xea829ad3... registered in block #48392099",
      status: "CONFIRMED",
      gas: "0.00142"
    },
    {
      id: "tx-init-3",
      timestamp: new Date(Date.now() - 1500).toLocaleTimeString(),
      type: "FAUCET",
      address: "0x2cd3...ef81",
      details: "Claimed +10.00 APT & +100.00 ShelbyUSD key tokens",
      status: "CONFIRMED",
      gas: "0.00000"
    }
  ]);

  // ------------------ INSTANT PLAYGROUND STATE ------------------
  const [playgroundText, setPlaygroundText] = useState('');
  const [playgroundFile, setPlaygroundFile] = useState<File | null>(null);
  const [playgroundHash, setPlaygroundHash] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [showSandboxResult, setShowSandboxResult] = useState(false);
  const playgroundInputRef = useRef<HTMLInputElement>(null);

  // Interval timers: Block Height ticker & TPS volatility
  useEffect(() => {
    const timer = setInterval(() => {
      // Tick block heights up by 1 or 2
      setBlockHeight(prev => prev + Math.floor(Math.random() * 2) + 1);

      // Fluctuate TPS
      setTps(prev => {
        const val = prev + (Math.random() * 4 - 2);
        return parseFloat(Math.max(8.4, Math.min(65.2, val)).toFixed(1));
      });

      // Update node latencies slightly
      setNetworkHeartbeats({
        usEast: Math.max(9, Math.min(18, 12 + Math.floor(Math.random() * 4 - 2))),
        euCentral: Math.max(18, Math.min(32, 24 + Math.floor(Math.random() * 6 - 3))),
        asiaPacific: Math.max(38, Math.min(58, 45 + Math.floor(Math.random() * 8 - 4)))
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Interval timer: Simulated Tx generator
  useEffect(() => {
    if (isFeedPaused) return;

    const generator = setInterval(() => {
      const addresses = [
        "0x38df...a92d", "0x51ca...ffbf", "0x98ed...ba23", "0x0f43...6d0f", 
        "0xea82...d2ef", "0x88de...3c11", "0x12bc...2abc", "0x2fb0...f89c"
      ];
      const selectedAddr = addresses[Math.floor(Math.random() * addresses.length)];
      
      const types: SimulatedTx['type'][] = ["BLOCK", "REGISTRY", "FAUCET", "LEASE"];
      const selectedType = types[Math.floor(Math.random() * types.length)];
      
      let details = "";
      let gas = "0.00142";

      if (selectedType === "BLOCK") {
        details = `Block #${blockHeight} proposed by Validator node #${Math.floor(Math.random() * 32) + 1}`;
        gas = "0.00014";
      } else if (selectedType === "REGISTRY") {
        const hashSeed = Math.random().toString(16).substring(2, 10);
        details = `Validated leaf root 0x${hashSeed}... and successfully anchored on-chain`;
        gas = "0.00142";
      } else if (selectedType === "FAUCET") {
        details = "Faucet drip of 10.00 APT & 100.00 ShelbyUSD processed";
        gas = "0.00000";
      } else {
        const filenames = ["main_contract.rs", "user_profile_img.png", "release_manifest_v2.json", "backup_vault_shards.tar"];
        const file = filenames[Math.floor(Math.random() * filenames.length)];
        details = `Storage lease for '${file}' extended successfully (+48h)`;
        gas = "0.00045";
      }

      const nextTx: SimulatedTx = {
        id: `tx-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: selectedType,
        address: selectedAddr,
        details,
        status: "CONFIRMED",
        gas
      };

      setSimulatedTxs(prev => [nextTx, ...prev.slice(0, 14)]);
    }, 3800);

    return () => clearInterval(generator);
  }, [blockHeight, isFeedPaused]);

  // Handle live playground input hashing
  const handleHashText = async (text: string) => {
    setPlaygroundText(text);
    if (!text.trim()) {
      setPlaygroundHash('');
      setShowSandboxResult(false);
      return;
    }
    setPlaygroundLoading(true);
    // instant browser-side sha-256 preview simulation
    try {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setPlaygroundHash(hashHex);
      setShowSandboxResult(true);
    } catch (err) {
      console.error(err);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const handlePlaygroundFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setPlaygroundLoading(true);
      setShowSandboxResult(false);
      try {
        const file = selectedFiles[0];
        setPlaygroundFile(file);
        setPlaygroundText(file.name);
        const hash = await calculateFileHash(file);
        setPlaygroundHash(hash);
        setShowSandboxResult(true);
      } catch (err) {
        console.error(err);
      } finally {
        setPlaygroundLoading(false);
      }
    }
  };

  // Staggered animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative z-10 font-sans text-gray-200">
      
      {/* 1. HERO SECTION WITH INSTANT DUAL LAYOUT: BRAND + LIVE BLOCKCHAIN TELEMETRY */}
      <section className="relative px-4 pt-12 pb-16 md:pt-20 md:pb-20 max-w-[1550px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Headings and CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Elegant Operational Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF]/10 to-transparent border border-[#00F0FF]/15 text-shadow"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase font-bold">
                Aptos Testnet Secure Node • Core V2 Online
              </span>
            </motion.div>

            {/* Title Block */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <motion.h1 
                variants={itemVariants} 
                className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none text-white text-shadow-lg"
              >
                SHELBY<span className="text-transparent bg-clip-text bg-gradient-to-r from-shelby-cyan to-shelby-purple filter drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">FORGE</span>
              </motion.h1>

              <motion.div 
                variants={itemVariants}
                className="text-lg sm:text-2xl text-[#818CF8] font-display font-bold leading-normal"
              >
                Immutable Storage and On-Chain Proofs
              </motion.div>

              <motion.p 
                variants={itemVariants}
                className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed"
              >
                An industrial-grade hot storage vault securing assets client-side. Instantly forge SHA-256 integrity trees, anchor Merkle leaf proofs on the Aptos ledger, and replicate shards across decentralized global validators.
              </motion.p>
            </motion.div>

            {/* Quick Connected Info banner */}
            {wallet.connected && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs flex items-center justify-between gap-3 max-w-md font-mono"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Wallet Synced: {wallet.address?.substring(0, 16)}...</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
                  Connected
                </span>
              </motion.div>
            )}

            {/* Elegant Primary Interactive Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-lg pt-2"
            >
              {wallet.connected ? (
                <button
                  onClick={() => setView('dashboard')}
                  className="w-full sm:w-auto bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display font-extrabold text-sm px-8 py-4 rounded-xl border border-white/10 hover:opacity-95 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Storage Vault</span>
                  <ChevronRight className="w-5 h-5 text-black" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display font-extrabold text-sm px-7 py-4 rounded-xl hover:opacity-95 hover:shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Coins className="w-4 h-4 text-black" />
                    <span>Connect Petra Wallet</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>

                  <button
                    onClick={() => setView('dashboard')}
                    className="w-full sm:w-auto border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-[#818CF8]/30 hover:text-white text-gray-300 font-display font-bold text-sm px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-[#818CF8]" />
                    <span>Enter Simulator Playground</span>
                  </button>
                </>
              )}
            </motion.div>

            {/* Quick telemetry tags */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 font-mono text-[10px] text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 font-bold hover:text-white transition-colors cursor-help" title="Crypt calculations run completely inside browser cache memory bounds">
                <Cpu className="w-3.5 h-3.5 text-shelby-cyan" /> Secure Local Cryptography
              </span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="flex items-center gap-1.5 font-bold hover:text-white transition-colors cursor-help" title="No real payment keys required. Funds sourced live from Aptos Devnet test Faucet.">
                <Zap className="w-3.5 h-3.5 text-[#818CF8]" /> Testnet Sponsored Gas
              </span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="flex items-center gap-1.5 font-bold hover:text-white transition-colors">
                <Server className="w-3.5 h-3.5 text-shelby-cyan" /> Sharded Redundancy
              </span>
            </div>
          </div>

          {/* Right Column: SLEEK HARDCORE TESTNET TELEMETRY CONSOLE & NETWORK MONITOR */}
          <div className="lg:col-span-6">
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-br from-shelby-cyan/20 to-shelby-purple/15 border border-white/5 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              {/* Corner accent glow */}
              <div className="absolute top-0 right-0 p-3 z-10 flex items-center gap-1.5 bg-black/85 border border-white/10 rounded-bl-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none">TESTNET ONLINE</span>
              </div>

              <div className="glass-panel-neon rounded-[15px] p-5 space-y-4 text-left">
                {/* Simulated block bar header */}
                <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                    <span className="text-[10px] font-mono text-gray-400 font-bold ml-2">SHELBY MONITOR HUB v2.8</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/25 font-bold animate-pulse-slow">
                    SYNCED: APTOS CHUNK LEDGER
                  </div>
                </div>

                {/* HARDWARE GRID STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">BLOCK HEIGHT</p>
                    <p className="text-sm font-mono font-bold text-white mt-1 select-all" id="block-height-value">
                      {blockHeight.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">NETWORK TPS</p>
                    <p className="text-sm font-mono font-bold text-[#00F0FF] mt-1">
                      {tps} Tx/s
                    </p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">VALIDATORS</p>
                    <p className="text-sm font-mono font-bold text-[#818CF8] mt-1">
                      {activeNodes} / 128
                    </p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">AVG BLK TIME</p>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-1">
                      1.24s
                    </p>
                  </div>
                </div>

                {/* WALLET METRICS & LATENCY PINGS */}
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono text-gray-500 font-bold block uppercase tracking-widest">Global Node Latency Heartbeats</span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-gray-300">
                    <div className="flex items-center justify-between bg-black/25 px-2 py-1.5 rounded-lg border border-white/[0.02]">
                      <span className="text-gray-500">🇺🇸 US-EAST:</span>
                      <span className="text-[#00F0FF] font-bold">{networkHeartbeats.usEast}ms</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/25 px-2 py-1.5 rounded-lg border border-white/[0.02]">
                      <span className="text-gray-500">🇪🇺 EU-CENT:</span>
                      <span className="text-[#818CF8] font-bold">{networkHeartbeats.euCentral}ms</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/25 px-2 py-1.5 rounded-lg border border-white/[0.02]">
                      <span className="text-gray-500">🇦🇺 AP-SOUTH:</span>
                      <span className="text-[#00F0FF] font-bold">{networkHeartbeats.asiaPacific}ms</span>
                    </div>
                  </div>
                </div>

                {/* SCROLLING TRANSACTION STREAM TERMINAL */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase text-gray-500 px-1">
                    <span>Live Shelby-Devnet Ledgers</span>
                    <button 
                      onClick={() => setIsFeedPaused(!isFeedPaused)}
                      className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-2 py-0.5 rounded cursor-pointer border border-white/5"
                    >
                      {isFeedPaused ? (
                        <>
                          <Play className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Resume Explorer Feed</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-2.5 h-2.5 text-amber-500" />
                          <span>Pause Feed</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terminal Log Console */}
                  <div className="h-44 bg-black/85 border border-white/10 rounded-xl p-3 font-mono text-[10.5px] overflow-y-auto space-y-2 scrollbar-thin scroll-smooth select-none">
                    <AnimatePresence>
                      {simulatedTxs.map((tx) => (
                        <motion.div 
                          key={tx.id}
                          initial={{ opacity: 0, x: -5, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-start gap-1 py-1 border-b border-white/[0.02] leading-tight"
                        >
                          <span className="text-gray-600 text-[9px] select-none shrink-0">{tx.timestamp}</span>
                          
                          <div className="flex flex-wrap items-center gap-1">
                            {/* Type tag */}
                            <span className={`text-[8.5px] px-1 rounded font-bold shrink-0 ${
                              tx.type === 'BLOCK' ? 'bg-indigo-500/10 text-[#818CF8] border border-indigo-500/20' :
                              tx.type === 'REGISTRY' ? 'bg-[rgba(0,240,255,0.1)] text-[#00F0FF] border border-[#00F0FF]/25' :
                              tx.type === 'FAUCET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-amber-500/10 text-[#ff9900] border border-[#ff9900]/20'
                            }`}>
                              [{tx.type}]
                            </span>

                            {/* Address signature link */}
                            <span className="text-[#818CF8] font-bold select-all shrink-0">{tx.address}</span>

                            {/* Details text */}
                            <span className="text-gray-300 font-sans">{tx.details}</span>

                            {/* Fee value */}
                            {tx.gas !== "0.00000" && (
                              <span className="text-gray-500 text-[9px] italic shrink-0">(gas: {tx.gas} APT)</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Explorer metadata indicator */}
                <div className="text-[9px] font-mono text-gray-500 flex justify-between items-center px-1">
                  <span>Replicating protocol: Aptos Move Ledger Contract</span>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="text-[#00F0FF] hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                  >
                    Launch Explorer Terminal ↗
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. NEW COMPONENT: THE INTERACTIVE BROWSER-SIDE TESTING PLAYGROUND */}
      <section className="py-12 border-t border-b border-white/[0.03] bg-black/[0.15] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-shelby-cyan/3 to-shelby-purple/3 pointer-events-none" />
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-2.5 py-1 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-mono text-[9px] font-bold text-[#00F0FF] uppercase tracking-wider inline-block">
              Immediate Zero-Trust Sandbox
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white mt-3">
              Test In-Browser Cryptography Right Now
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed font-sans">
              No wallet connected? No problem. Calculate custom SHA-256 integrity fingerprints instantly in your browser memory. We never transmit your local bytes outwards.
            </p>
          </div>

          <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-6 border-white/5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
            
            {/* Playground left: file or text inputs */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">1. Input Text or Drop a File</span>
                
                {/* Method A: Text hashing */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] text-gray-400 font-sans block">Type secret text or sentence:</label>
                  <input
                    type="text"
                    value={playgroundText}
                    onChange={(e) => {
                      setPlaygroundFile(null);
                      handleHashText(e.target.value);
                    }}
                    placeholder="Enter message to generate raw signature leaf..."
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-gray-200 focus:outline-none focus:border-[#00F0FF] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-[1px] bg-white/5 flex-grow" />
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Or local resource file</span>
                  <div className="h-[1px] bg-white/5 flex-grow" />
                </div>

                {/* Method B: File Upload click */}
                <div 
                  onClick={() => playgroundInputRef.current?.click()}
                  className="p-4 border border-dashed border-white/10 hover:border-shelby-purple/35 hover:bg-white/[0.01] transition-all rounded-xl cursor-not-allowed justify-center items-center text-center space-y-1.5 select-none"
                  title="Connect Petra Wallet inside storage terminal for multi-segment chunk files uploads."
                >
                  <input 
                    type="file"
                    ref={playgroundInputRef}
                    onChange={handlePlaygroundFileDrop}
                    className="hidden"
                  />
                  <Database className="w-5 h-5 text-gray-500 mx-auto" />
                  <p className="text-[11px] text-gray-400 font-bold">Select test files copy to compile instantly</p>
                  <p className="text-[9px] text-gray-500 font-mono leading-none">Security check: calculations are strictly sandboxed</p>
                </div>
              </div>

              {playgroundLoading && (
                <div className="text-xs font-mono text-[#00F0FF] flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />
                  <span>Computing SHA-256 tree index...</span>
                </div>
              )}

              <div className="pt-2">
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                  *Disclaimer: Anchoring Merkle leaf signatures permanently inside Aptos mainnet requires gas signatures from the connected Petra account.
                </p>
              </div>
            </div>

            {/* Playground right: real-time hashing results preview */}
            <div className="p-5 rounded-xl bg-black/65 border border-white/[0.05] flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-[#818CF8] uppercase tracking-widest font-bold block">2. Browser compiled integrity block</span>

                {showSandboxResult ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3.5 text-left font-mono text-xs"
                  >
                    <div>
                      <span className="text-gray-500 text-[8.5px] uppercase">Input asset source</span>
                      <p className="text-white font-sans font-bold truncate text-[11.5px] mt-0.5">
                        {playgroundFile ? `📄 File: ${playgroundFile.name}` : `💬 Text Sentence: "${playgroundText}"`}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#00F0FF] text-[8.5px] uppercase">Computed Browser Fingerprint (SHA-256)</span>
                      <p className="text-emerald-400 font-mono font-bold break-all text-[11px] leading-relaxed p-2 bg-black/40 border border-white/5 rounded-lg mt-0.5 select-all">
                        {playgroundHash}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-white/[0.04] pt-2.5">
                      <div>
                        <span className="text-gray-500">ROOT MERKLE:</span>
                        <p className="text-[#818CF8] font-bold truncate">0x{playgroundHash.substring(0, 12)}...ffff</p>
                      </div>
                      <div>
                        <span className="text-gray-500">CUSTODY CHUNKS:</span>
                        <p className="text-white font-bold">{playgroundFile ? Math.max(1, Math.ceil(playgroundFile.size / 1024000)) : 1} segment shard</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-8 text-center text-gray-500 font-mono text-xs space-y-1">
                    <p>Terminal offline.</p>
                    <p className="text-[10px] text-gray-600">Enter sample configurations or text on the left to activate signature blocks.</p>
                  </div>
                )}
              </div>

              {showSandboxResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2"
                >
                  <button
                    onClick={() => {
                      if (playgroundFile) {
                        // Pass file into storage or navigate
                        setView('dashboard');
                      } else {
                        setView('dashboard');
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display font-extrabold text-xs uppercase rounded-xl hover:opacity-95 text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Anchor This Record In The Forge</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                  </button>
                </motion.div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 3. CORE FEATURES ADVANTAGES SECTION */}
      <section className="py-16 border-b border-white/[0.03] bg-black/[0.05]">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Elite Decentralized Security Redefined
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
              By combining sub-millisecond local hash generation with absolute L1 validation and Shelby sharded redundancy, we set a premium benchmark for secure, auditable static file storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-panel hover:border-white/10 transition-all flex flex-col justify-between group cursor-default">
              <div>
                <div className="p-3 w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-shelby-cyan/30 transition-colors mb-5">
                  <Shield className="w-6 h-6 text-shelby-cyan" />
                </div>
                <h4 className="font-display text-base font-bold text-white mb-1.5 group-hover:text-shelby-cyan transition-colors">
                  Verifiable Cryptography
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Perform secure browser-side computations to generate SHA-256 integrity trees. Your raw system files are fully hashed before they ever reach the network.
                </p>
              </div>
              <div className="mt-5 flex items-center justify-end">
                <span className="text-[9px] font-mono font-medium uppercase text-gray-600 group-hover:text-shelby-purple transition-colors flex items-center gap-0.5">
                  Node Pinning <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-white/10 transition-all flex flex-col justify-between group cursor-default">
              <div>
                <div className="p-3 w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-shelby-cyan/30 transition-colors mb-5">
                  <BrainCircuit className="w-6 h-6 text-[#818CF8]" />
                </div>
                <h4 className="font-display text-base font-bold text-white mb-1.5 group-hover:text-shelby-cyan transition-colors">
                  Aptos Testnet Trust Anchor
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Register Merkle root fingerprints directly on the secure Aptos blockchain ledger. Create robust, unalterable timestamps of your data's state of existence.
                </p>
              </div>
              <div className="mt-5 flex items-center justify-end">
                <span className="text-[9px] font-mono font-medium uppercase text-gray-600 group-hover:text-shelby-purple transition-colors flex items-center gap-0.5">
                  On-chain Witnesses <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-white/10 transition-all flex flex-col justify-between group cursor-default">
              <div>
                <div className="p-3 w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-shelby-cyan/30 transition-colors mb-5">
                  <HardDrive className="w-6 h-6 text-shelby-cyan" />
                </div>
                <h4 className="font-display text-base font-bold text-white mb-1.5 group-hover:text-shelby-cyan transition-colors">
                  Shelby Shard Vaults
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Store encrypted asset segments across lightning-fast decentralized server clusters. Leverage active heartbeats with automated checksum maintenance.
                </p>
              </div>
              <div className="mt-5 flex items-center justify-end">
                <span className="text-[9px] font-mono font-medium uppercase text-gray-600 group-hover:text-shelby-purple transition-colors flex items-center gap-0.5">
                  Redundancy Level <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-white/10 transition-all flex flex-col justify-between group cursor-default">
              <div>
                <div className="p-3 w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-shelby-cyan/30 transition-colors mb-5">
                  <Key className="w-6 h-6 text-[#818CF8]" />
                </div>
                <h4 className="font-display text-base font-bold text-white mb-1.5 group-hover:text-shelby-cyan transition-colors">
                  Absolute Owner Control
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Instantly toggle between encrypted private mode and public verified search mode. Secure decentralized share links styled with cryptography proofs.
                </p>
              </div>
              <div className="mt-5 flex items-center justify-end">
                <span className="text-[9px] font-mono font-medium uppercase text-gray-600 group-hover:text-shelby-purple transition-colors flex items-center gap-0.5">
                  Public Key Auth <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
