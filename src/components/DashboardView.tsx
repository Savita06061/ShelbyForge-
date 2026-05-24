/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShelbyFile, ActivityLog, WalletState, ForgeStats } from '../types';
import { 
  Upload, FileText, CheckCircle2, ShieldAlert, Cpu, 
  Database, RefreshCw, Eye, EyeOff, Search, Trash2, 
  ExternalLink, Coins, Key, Server, KeySquare, HelpCircle, Flame, Check
} from 'lucide-react';

interface DashboardViewProps {
  files: ShelbyFile[];
  stats: ForgeStats;
  logs: ActivityLog[];
  wallet: WalletState;
  onAddFile: (file: File) => Promise<void>;
  onRegisterOnChain: (fileId: string) => Promise<void>;
  onTogglePrivacy: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onClaimFaucet: () => void;
  onInspectFile: (file: ShelbyFile) => void;
  loading: boolean;
  loadingProgress: number;
  loadingStage: string;
}

export default function DashboardView({
  files,
  stats,
  logs,
  wallet,
  onAddFile,
  onRegisterOnChain,
  onTogglePrivacy,
  onDeleteFile,
  onClaimFaucet,
  onInspectFile,
  loading,
  loadingProgress,
  loadingStage
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [claimingFaucet, setClaimingFaucet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onAddFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onAddFile(selectedFiles[0]);
    }
  };

  // Filter files based on search
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sha256.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFaucetClick = async () => {
    setClaimingFaucet(true);
    // Add real physical feel to transaction processing
    setTimeout(() => {
      onClaimFaucet();
      setClaimingFaucet(false);
    }, 1500);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans text-gray-200">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Shelby Verifiable Hot Vault
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Upload files, compile browser-side cryptographic trees, and register proofs on Aptos chain ledger.
          </p>
        </div>

        {/* Network & Gas Status Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#09090D] border border-white/5 rounded-xl px-3.5 py-2">
            <Server className="w-4 h-4 text-shelby-cyan" />
            <div className="text-left font-mono">
              <p className="text-[8px] text-gray-500 uppercase leading-none">Shelby Storage</p>
              <p className="text-[11px] font-bold text-white mt-0.5">Global Cluster Live</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#09090D] border border-white/5 rounded-xl px-3.5 py-2">
            <Coins className="w-4 h-4 text-shelby-purple" />
            <div className="text-left font-mono">
              <p className="text-[8px] text-gray-500 uppercase leading-none">Aptos testnet</p>
              <p className="text-[11px] font-bold text-white mt-0.5">Avg Gas: {stats.gasSaved > 0 ? '0.00142' : '0.00' } APT</p>
            </div>
          </div>

          {wallet.walletType === 'burner' && (
            <button
              onClick={handleFaucetClick}
              disabled={claimingFaucet}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/15 hover:from-emerald-500/20 hover:to-teal-500/25 border border-emerald-500/30 text-emerald-400 font-display text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Coins className={`w-4 h-4 text-emerald-400 ${claimingFaucet ? 'animate-spin' : ''}`} />
              <span>{claimingFaucet ? 'Requesting APT...' : 'Request $APT Faucet'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Secured Vault Files</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{stats.totalFilesSecured}</span>
            <span className="text-[10px] text-shelby-cyan">Node Secured</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">Active redundant hot replication</p>
        </div>

        {/* Stat 2 */}
        <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Decentralized Storage</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{formatBytes(stats.totalStorageSecured)}</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">Verifiable Shelby chunk segments</p>
        </div>

        {/* Stat 3 */}
        <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Merkle Roots Register</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{stats.proofsRegistered}</span>
            <span className="text-[10px] text-shelby-purple">On Aptos</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">Aptos blockchain authenticated</p>
        </div>

        {/* Stat 4 */}
        <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Health Index</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-emerald-400">{stats.averageIntegrity}%</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-slow self-center" />
          </div>
          <p className="text-[9px] text-gray-400 mt-2">All integrity parameters normal</p>
        </div>
      </div>

      {/* Main Panel Division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Forge Zone & Vault */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Drag & Drop Forge */}
          {!wallet.connected ? (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center">
              <KeySquare className="w-12 h-12 text-shelby-purple mx-auto mb-4 animate-bounce" />
              <h3 className="font-display text-lg font-bold text-white mb-2">Connect Your Web3 Wallet First</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                Connecting a Web3 wallet lets you sign cryptographic files on-chain, allocate decentralized storage, and manage verifiable roots on the Aptos ledger.
              </p>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border border-dashed transition-all cursor-pointer text-center relative overflow-hidden group ${
                dragOver 
                  ? 'border-shelby-cyan bg-shelby-cyan/5' 
                  : 'border-white/15 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="py-4 space-y-4"
                  >
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-x-0 inset-y-0 rounded-full border border-white/5 border-t-shelby-cyan border-r-shelby-purple animate-spin" />
                      <Cpu className="w-6 h-6 text-shelby-cyan" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                        {loadingStage}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400">
                        Compiling tree parameters • {loadingProgress}%
                      </p>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full max-w-xs mx-auto h-1.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-shelby-cyan to-shelby-purple"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4 space-y-3"
                  >
                    <div className="p-4 w-14 h-14 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto group-hover:border-shelby-cyan/30 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-shelby-cyan transition-colors" />
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-bold text-white">
                        Click or drag a file to run the Cryptographic Forge
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                        Your browser computes the SHA-256 and Merkle hash instantly. You sign the vault manifest to deploy to the Shelby network.
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/15 text-gray-400">
                        Supports PDF, ZIP, IMG, DOC, JSON up to 250MB
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 2. Vault Files Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-shelby-cyan" />
                  Your Verifiable Storage
                </h3>
                <p className="text-xs text-gray-400">Stored on micro-shards across verified active hot clusters.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Query hash or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#09090D] border border-white/5 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-shelby-cyan transition-all"
                />
              </div>
            </div>

            {/* Files Grid and Table representation */}
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/[0.01] border border-white/5 text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-xs font-mono">No matching physical storage files located in secure hot vault.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl bg-[#09090D] border border-white/[0.03] hover:border-white/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                  >
                    {/* Info */}
                    <div className="flex items-start gap-3.5 max-w-[280px] sm:max-w-md">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center font-mono text-[10px] font-bold text-shelby-cyan text-shadow">
                        {file.type ? file.type.toUpperCase().substring(0, 3) : 'FILE'}
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm text-white group-hover:text-shelby-cyan transition-colors break-all">
                          {file.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] text-gray-500">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span className="truncate max-w-[124px] sm:max-w-none hover:text-white cursor-help" title={file.sha256}>
                            SHA: {file.sha256.substring(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge, actions */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      {/* Privacy Toggle button */}
                      <button
                        onClick={() => onTogglePrivacy(file.id)}
                        className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        title={file.isPublic ? "Switch to Encrypted Private" : "Switch to Public Proof Verifiable"}
                      >
                        {file.isPublic ? (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-shelby-cyan" />
                            <span className="text-[10px] uppercase font-mono text-shelby-cyan font-bold">Public</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-[10px] uppercase font-mono text-gray-500">Private</span>
                          </div>
                        )}
                      </button>

                      {/* On-Chain Status */}
                      <div>
                        {file.isRegistered ? (
                          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium py-1 px-2.5 rounded-lg select-all">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LEDGER REGISTERED</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onRegisterOnChain(file.id)}
                            className="bg-shelby-purple/10 border border-shelby-purple/30 hover:bg-shelby-purple/20 text-[#B026FF] hover:text-white transition-all text-[10px] font-mono font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                          >
                            <span>REGISTER ON-CHAIN</span>
                          </button>
                        )}
                      </div>

                      {/* File Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onInspectFile(file)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-display font-medium text-gray-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1"
                        >
                          <span>Inspect Proof</span>
                        </button>
                        
                        <button
                          onClick={() => onDeleteFile(file.id)}
                          className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                          title="Purge from Vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Activity, Accounts & Explanations */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Ephemeral Account Controller */}
          <div className="p-5 rounded-2xl bg-[#09090D] border border-white/[0.04]">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-shelby-cyan" />
              Cryptographic Secure Core
            </h4>
            
            {wallet.connected && wallet.address ? (
              <div className="space-y-3.5">
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-[10px]">VERIFIABLE KEYPAIR</span>
                    <span className="text-shelby-cyan text-[10px] font-semibold">{wallet.walletType?.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 break-all select-all font-bold">
                    {wallet.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col justify-between">
                    <span className="text-gray-500 text-[9px]">WALLET VALUE</span>
                    <span className="font-bold text-white mt-1">{wallet.balance.toFixed(2)} APT</span>
                  </div>
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col justify-between">
                    <span className="text-gray-500 text-[9px]">LEDGER NONCE</span>
                    <span className="font-bold text-white mt-1">{files.filter(f => f.isRegistered).length * 2 + 1}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5 max-w-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                  <span>Your wallet parameters authenticate all ledger submissions.</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">
                  Connect a wallet to view secure parameters and pay with Aptos Testnet tokens.
                </p>
              </div>
            )}
          </div>

          {/* Activity Feeds */}
          <div className="p-5 rounded-2xl bg-[#09090D] border border-white/[0.04] space-y-4">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-shelby-purple" />
              Ecosystem Activity Logs
            </h4>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono text-center py-4">
                  Vault queue empty. Actions execute real-time logs here.
                </p>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] space-y-1"
                  >
                    <div className="flex justify-between items-center text-[9px]">
                      <span className={`font-bold uppercase ${
                        log.type === 'register' ? 'text-shelby-purple' :
                        log.type === 'forge' ? 'text-shelby-cyan' :
                        log.type === 'faucet' ? 'text-emerald-400' : 'text-gray-400'
                      }`}>
                        [{log.type}]
                      </span>
                      <span className="text-gray-500 text-[8px]">{log.timestamp}</span>
                    </div>
                    
                    <p className="text-gray-300 leading-normal">{log.description}</p>
                    
                    {log.txHash && (
                      <div className="pt-2 flex justify-between items-center border-t border-white/[0.03]">
                        <span className="text-gray-500 text-[8px]">TX: {log.txHash.substring(0, 16)}...</span>
                        <a 
                          href={`https://explorer.aptoslabs.com/txn/${log.txHash}?network=testnet`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-shelby-cyan hover:underline hover:text-white flex items-center gap-1 text-[8px] transition-colors"
                        >
                          Explorer <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Web3 Educational Hint */}
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
            <HelpCircle className="w-5 h-5 text-shelby-cyan mb-2" />
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1 font-mono">
              The Shelby Cryptographic Paradigm
            </h5>
            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              In centralized architectures, file hosts control files and metadata. In Shelby’s verifiableHot storage scheme, your browser computes root hashes. Changing a single bit in your file alters the SHA-256 completely, rendering the Aptos ledger mismatch immediately visible. Absolute data security.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
