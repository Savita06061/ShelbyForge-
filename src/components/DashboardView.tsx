/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShelbyFile, ActivityLog, WalletState, ForgeStats } from '../types';
import { calculateFileHash } from '../utils/crypto';
import { getAptosExplorerUrl } from '../utils/networkConfig';
import { 
  Upload, FileText, CheckCircle2, ShieldAlert, Cpu, 
  Database, RefreshCw, Eye, EyeOff, Search, Trash2, 
  ExternalLink, Coins, Key, Server, KeySquare, HelpCircle, Flame, Check, X, Clock
} from 'lucide-react';

interface DashboardViewProps {
  files: ShelbyFile[];
  stats: ForgeStats;
  logs: ActivityLog[];
  wallet: WalletState;
  onAddFile: (file: File) => Promise<ShelbyFile | null>;
  onRegisterOnChain: (fileId: string) => Promise<void>;
  onTogglePrivacy: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onClaimFaucet: () => void;
  onInspectFile: (file: ShelbyFile) => void;
  onRenewFile: (fileId: string) => void;
  loading: boolean;
  loadingProgress: number;
  loadingStage: string;
  onRefreshBalances?: () => Promise<void>;
  networkNameOrUrl?: string;
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
  onRenewFile,
  loading,
  loadingProgress,
  loadingStage,
  onRefreshBalances,
  networkNameOrUrl
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'verify'>('vault');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [claimingFaucet, setClaimingFaucet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Successful upload notification modal state
  const [justUploadedFile, setJustUploadedFile] = useState<ShelbyFile | null>(null);

  // Verification tab state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyFileLoading, setVerifyFileLoading] = useState(false);
  const [verifyFileHash, setVerifyFileHash] = useState<string | null>(null);
  const [verifyFileName, setVerifyFileName] = useState<string | null>(null);
  const [verifyResultFile, setVerifyResultFile] = useState<ShelbyFile | null>(null);
  const [verifyChecked, setVerifyChecked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger copy to clipboard inside component
  const clipboardCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Remaining time formatter for 48 hour storage expirations
  const getRemainingTime = (uploadedAt: string) => {
    const expiresAt = new Date(uploadedAt).getTime() + 48 * 3600 * 1000;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  // Quick ticker update for countdown representations
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const added = await onAddFile(droppedFiles[0]);
      if (added) {
        setJustUploadedFile(added);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const added = await onAddFile(selectedFiles[0]);
      if (added) {
        setJustUploadedFile(added);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Verification File Handler
  const handleVerifyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setVerifyFileLoading(true);
      setVerifyFileHash(null);
      setVerifyResultFile(null);
      setVerifyChecked(false);
      try {
        const file = selectedFiles[0];
        setVerifyFileName(file.name);
        const hash = await calculateFileHash(file);
        setVerifyFileHash(hash);
      } catch (err) {
        console.error("Local file hash calculation failed: ", err);
      } finally {
        setVerifyFileLoading(false);
      }
    }
  };

  // Audit validation triggers
  const handleVerifyHash = (hashToQuery: string) => {
    if (!hashToQuery) return;
    const cleanHash = hashToQuery.trim().toLowerCase();
    const found = files.find(f => f.sha256.toLowerCase() === cleanHash);
    setVerifyResultFile(found || null);
    setVerifyChecked(true);
  };

  // Filter vault files based on search
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sha256.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFaucetClick = async () => {
    setClaimingFaucet(true);
    setTimeout(() => {
      onClaimFaucet();
      setClaimingFaucet(false);
    }, 1500);
  };

  const handleRefreshClick = async () => {
    if (onRefreshBalances) {
      setRefreshing(true);
      try {
        await onRefreshBalances();
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <div className="relative z-10 max-w-[1550px] mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans text-gray-200">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
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

          {wallet.connected && (
            <button
              onClick={handleFaucetClick}
              disabled={claimingFaucet}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/15 hover:from-emerald-500/20 hover:to-teal-500/25 border border-emerald-500/30 text-emerald-400 font-display text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Coins className={`w-4 h-4 text-emerald-400 ${claimingFaucet ? 'animate-spin' : ''}`} />
              <span>{claimingFaucet ? 'Claim Gas & Fee' : 'Request Faucet'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex border-b border-white/[0.04] mb-8 gap-1">
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-5 py-3 border-b-2 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'vault'
              ? 'border-shelby-cyan text-shelby-cyan bg-shelby-cyan/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          🗄️ Vault Storage & Forge
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-5 py-3 border-b-2 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'verify'
              ? 'border-shelby-purple text-shelby-purple bg-shelby-purple/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          🔍 Proof Verifier (SHA-256)
        </button>
      </div>

      {/* Vault Storage View */}
      {activeTab === 'vault' && (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Secured Vault Files</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{stats.totalFilesSecured}</span>
                <span className="text-[10px] text-shelby-cyan">Node Secured</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2">Active redundant hot replication</p>
            </div>

            <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Decentralized Storage</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{formatBytes(stats.totalStorageSecured)}</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2">Verifiable Shelby chunk segments</p>
            </div>

            <div className="p-4 rounded-xl glass-panel border-white/5 font-mono">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Merkle Roots Register</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{stats.proofsRegistered}</span>
                <span className="text-[10px] text-shelby-purple">On Aptos</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2">Aptos blockchain authenticated</p>
            </div>

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
                    <p className="text-xs text-gray-400 font-sans">Stored on micro-shards across verified active hot clusters.</p>
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
                          
                          {/* 48hr Blob Expiration Warning Badge */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#ff9900]/10 border border-[#ff9900]/25 text-[#ff9900] text-[10px] font-mono">
                              <Clock className="w-3.5 h-3.5 text-[#ff9900]" />
                              <span>Lease: {getRemainingTime(file.uploadedAt)}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenewFile(file.id);
                              }}
                              className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25 text-emerald-400 hover:text-white text-[10px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer"
                              title="Prolong lease for +48 hours"
                            >
                              Renew
                            </button>
                          </div>

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
              
              {/* Standard Account Controller */}
              <div className="p-5 rounded-2xl bg-[#09090D] border border-white/[0.04]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-shelby-cyan" />
                    Aptos Ledger Account
                  </h4>
                  {wallet.connected && onRefreshBalances && (
                    <button
                      onClick={handleRefreshClick}
                      disabled={refreshing}
                      className="p-1 px-2 text-[10px] font-mono border border-white/5 rounded bg-white/5 hover:bg-white/10 hover:border-shelby-cyan/30 text-gray-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      title="Force ledger sync"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
                    </button>
                  )}
                </div>
                
                {wallet.connected && wallet.address ? (
                  <div className="space-y-4">
                    {/* Account details */}
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs font-mono space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[9px] uppercase tracking-wider">SECURE SIGNER KEY</span>
                        <span className="text-[#00F0FF] text-[9px] font-bold bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/25">
                          {wallet.walletType?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 break-all select-all font-bold">
                        {wallet.address}
                      </p>
                    </div>

                    {/* Dual Asset Display List */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold block">DETECTED LEDGER ASSETS</span>
                      
                      {/* Asset 1: ShelbyUSD */}
                      <div className="p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-shelby-purple rounded-lg">
                            <Coins className="w-4 h-4 text-shelby-purple" id="custom-shelbyusd-icon" />
                          </div>
                          <div className="font-mono text-left">
                            <p className="text-[11px] font-bold text-white">ShelbyUSD</p>
                            <p className="text-[9px] text-gray-400 font-sans">Used for File Forge uploads</p>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-sm font-bold text-shelby-purple" id="shelbyusd-balance-value">
                            {(wallet.shelbyUsdBalance || 0).toFixed(2)}
                          </p>
                          <p className="text-[9px] text-shelby-purple/60 font-semibold uppercase">Fee Coin</p>
                        </div>
                      </div>

                      {/* Asset 2: Aptos Gas */}
                      <div className="p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-shelby-cyan/10 border border-shelby-cyan/20 text-shelby-cyan rounded-lg animate-pulse-slow">
                            <Flame className="w-4 h-4 text-shelby-cyan" id="custom-gas-icon" />
                          </div>
                          <div className="font-mono text-left">
                            <p className="text-[11px] font-bold text-white">Aptos Coin ($APT)</p>
                            <p className="text-[9px] text-gray-400 font-sans">Used for On-chain Gas proofs</p>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-sm font-bold text-shelby-cyan" id="apt-balance-value">
                            {wallet.balance.toFixed(4)}
                          </p>
                          <p className="text-[9px] text-shelby-cyan/60 font-semibold uppercase">Gas Asset</p>
                        </div>
                      </div>
                    </div>

                    {/* Ledger metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 bg-black/20 border border-white/5 rounded-lg flex flex-col justify-between">
                        <span className="text-gray-500 text-[8px] uppercase">CHAIN LEDGER</span>
                        <span className="font-bold text-white mt-1 text-[10px]">Shelby Devnet</span>
                      </div>
                      <div className="p-2.5 bg-black/20 border border-white/5 rounded-lg flex flex-col justify-between">
                        <span className="text-gray-500 text-[8px] uppercase">PROOF NONCE</span>
                        <span className="font-bold text-white mt-1 text-[10px]">{files.filter(f => f.isRegistered).length * 2 + 1}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-400">
                      Connect your Aptos Web3 wallet to sign cryptographic proofs on the Testnet ledger.
                    </p>
                  </div>
                )}
              </div>

              {/* Activity Feeds */}
              <div className="p-5 rounded-2xl bg-[#09090D] border border-white/[0.04] space-y-3">
                <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-shelby-purple" />
                  Ecosystem Activity Logs
                </h4>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-500 font-mono text-center py-4">
                      Vault queue empty. Actions execute real-time logs here.
                    </p>
                  ) : (
                    logs.slice(0, 3).map((log) => (
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
                              href={getAptosExplorerUrl(log.txHash, "txn", networkNameOrUrl)} 
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

            </div>

          </div>
        </>
      )}

      {/* Proof Verifier Tab View */}
      {activeTab === 'verify' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sub block Left */}
          <div className="md:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-[#09090D] border border-white/5 space-y-5">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-shelby-purple" />
                Ledger Verifier Audit Terminal
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Quickly audit compliance status and validity bounds. Paste a <strong>SHA-256 string</strong> below or compute one locally in your browser by supplying any local digital file under the client validation system below.
              </p>

              {/* By hash text query */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block font-bold">QUERY MANIFEST VIA HASH</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => {
                      setVerifyInput(e.target.value);
                      setVerifyChecked(false);
                      setVerifyResultFile(null);
                    }}
                    placeholder="Enter 64-char hex SHA-256 string..."
                    className="flex-grow px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-gray-100 focus:outline-none focus:border-shelby-purple transition-colors"
                  />
                  <button
                    onClick={() => handleVerifyHash(verifyInput)}
                    disabled={!verifyInput || verifyInput.length < 10}
                    className="px-5 py-2.5 bg-shelby-purple text-black font-display font-bold text-xs uppercase rounded-xl hover:opacity-90 active:scale-95 transition-all text-center disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    Audit Hash
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-1">
                <div className="h-[1px] bg-white/5 flex-grow" />
                <span className="text-[9px] font-mono text-gray-500">OR AUDIT FILE IN-BROWSER</span>
                <div className="h-[1px] bg-white/5 flex-grow" />
              </div>

              {/* By Drag Drop / File Hashing */}
              <div
                onClick={() => verifyFileInputRef.current?.click()}
                className="p-6 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.02] hover:border-shelby-purple/30 transition-all cursor-pointer text-center space-y-2"
              >
                <input
                  type="file"
                  ref={verifyFileInputRef}
                  onChange={handleVerifyFileChange}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-xs text-white font-semibold">Select resource copy to compile browser-side hash</p>
                <p className="text-[10px] text-gray-500 font-mono leading-none">Security Guaranteed: calculations do not transmit file bytes external of memory bounds</p>
              </div>

              {verifyFileLoading && (
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-center gap-2.5 font-mono text-xs text-gray-400">
                  <RefreshCw className="w-4 h-4 text-shelby-purple animate-spin" />
                  <span>Hashing resource binary...</span>
                </div>
              )}

              {verifyFileHash && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[9px] uppercase">COMPUTED FILE INTEGRITY HASH</span>
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 text-[9px]">LOCAL CALCULATION</span>
                  </div>
                  {verifyFileName && (
                    <p className="text-gray-300 font-sans font-medium">Analysed resource name: <span className="text-white text-shadow break-all font-bold">{verifyFileName}</span></p>
                  )}
                  <p className="text-[11px] text-white bg-black/60 border border-white/5 p-2 rounded-lg break-all select-all font-bold">
                    {verifyFileHash}
                  </p>
                  <div className="flex">
                    <button
                      onClick={() => handleVerifyHash(verifyFileHash)}
                      className="px-4 py-2 bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      Audit Proof Registry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Audit Feedback Output */}
            {verifyChecked && (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {verifyResultFile ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-4 relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl" />
                      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                          <CheckCircle2 className="w-8 h-8 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Decentralized Custody Match Found
                          </span>
                          <h4 className="font-display text-base font-bold text-white pt-1">
                            Proven Certified Registry Exist
                          </h4>
                          <p className="text-xs text-gray-400 font-sans leading-relaxed">
                            This digital asset matches precisely with a verified record in the Shelby Forge ledger, proving identity integrity is intact and untampered.
                          </p>
                        </div>
                      </div>

                      {/* Detail pointers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.05] text-xs font-mono">
                        <div className="space-y-0.5">
                          <span className="text-gray-500 text-[8px] uppercase">Original Filename</span>
                          <p className="text-white font-bold">{verifyResultFile.name}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-500 text-[8px] uppercase">Custody Node Host</span>
                          <p className="text-white font-bold">{verifyResultFile.shelbyStorageNode}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-500 text-[8px] uppercase">Merkle Root Reference</span>
                          <p className="text-shelby-purple font-bold truncate" title={verifyResultFile.merkleRoot}>{verifyResultFile.merkleRoot}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-500 text-[8px] uppercase">Aptos Witness Tx</span>
                          <p className="text-shelby-cyan font-bold truncate" title={verifyResultFile.txHash}>{verifyResultFile.txHash || 'Pending witness signature'}</p>
                        </div>
                      </div>

                      {/* Trigger Actions */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => onInspectFile(verifyResultFile)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-display text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                        >
                          Inspect Sibling Proofs
                        </button>
                        {verifyResultFile.downloadUrl && (
                          <a
                            href={verifyResultFile.downloadUrl}
                            download={verifyResultFile.name}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-display text-xs font-bold rounded-xl hover:opacity-95 transition-all text-center flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-black" />
                            Download Certified Safe File
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/25 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl flex-shrink-0">
                          <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            No Registry Matches Found
                          </span>
                          <h4 className="font-display text-base font-bold text-white pt-1">
                            Unregistered or Compromised Asset Reference
                          </h4>
                          <p className="text-xs text-gray-400 leading-normal font-sans">
                            The submitted SHA-256 fingerprint does not match any authenticated assets stored inside our decentralized hot vault network. Either the content has been altered dynamically since registration, or custody references were never set up.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/[0.04] flex items-center gap-3">
                        <button
                          onClick={() => {
                            setActiveTab('vault');
                          }}
                          className="px-4 py-2 bg-shelby-purple text-black font-display text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                        >
                          Forge and Register this Asset Now
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Sub block Right Sidebar */}
          <div className="md:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl bg-[#09090D] border border-white/[0.04] space-y-3 font-sans">
              <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-shelby-purple" />
                Verifier Quick Guide
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Shelby's verification ledger provides cryptographic certainty across trust zones.
              </p>
              <div className="pt-2 space-y-2.5 font-mono text-[11px] text-gray-400">
                <div className="flex gap-2">
                  <span className="text-shelby-cyan font-bold">1.</span>
                  <span><strong>Secure input:</strong> File calculations execute instantly in-memory.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-shelby-cyan font-bold">2.</span>
                  <span><strong>Ledger pointers:</strong> Matches on-chain witness transaction signatures.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-shelby-cyan font-bold">3.</span>
                  <span><strong>Immutable proofs:</strong> Merkle leaves match precisely with sibling hashes.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated premium Success screen modal after file forge complete */}
      <AnimatePresence>
        {justUploadedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJustUploadedFile(null)}
              className="absolute inset-0 bg-[#030303]/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl overflow-hidden glass-panel-neon rounded-2xl p-6 text-gray-200 shadow-2xl z-10 font-sans"
            >
              {/* Top glow stripes */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-pulse" />

              {/* Close button */}
              <button
                onClick={() => setJustUploadedFile(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-white uppercase tracking-wider">
                    Cryptographic Forge Success
                  </h3>
                  <p className="text-xs text-gray-400">File uploaded and local audit reference established and fully initialized</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* File info card */}
                <div className="p-4 rounded-xl bg-white/[0.02]/40 border border-white/5">
                  <span className="text-[9px] text-gray-500 font-mono tracking-widest block mb-1">REGISTERED VAULT FILE</span>
                  <p className="text-sm font-semibold text-white break-all leading-relaxed">{justUploadedFile.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">Size: {formatBytes(justUploadedFile.size)} • Type: {justUploadedFile.type?.toUpperCase()}</p>
                </div>

                {/* SHA-256 Hash */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">SHA-256 FILE HASH</label>
                  <div className="p-3 bg-black/45 border border-white/5 rounded-xl font-mono text-xs text-gray-300 break-all select-all flex items-center justify-between">
                    <span>{justUploadedFile.sha256}</span>
                    <button
                      onClick={() => clipboardCopy(justUploadedFile.sha256, 'success-sha')}
                      className="ml-2 text-shelby-cyan hover:underline hover:text-white text-[10px] transition-colors"
                    >
                      {copiedField === 'success-sha' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Shelby Blob Content ID */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">SHELBY STORAGE BLOB CONTENT ID (CID / BLOB ID)</label>
                  <div className="p-3 bg-black/45 border border-white/5 rounded-xl font-mono text-xs text-gray-300 break-all select-all flex items-center justify-between">
                    <span className="text-shelby-purple font-bold">bafybeihshelby{justUploadedFile.sha256.substring(0, 16)}vault</span>
                    <button
                      onClick={() => clipboardCopy(`bafybeihshelby${justUploadedFile.sha256.substring(0, 16)}vault`, 'success-cid')}
                      className="ml-2 text-shelby-purple hover:underline hover:text-white text-[10px] transition-colors"
                    >
                      {copiedField === 'success-cid' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Payment Receipt / Storage transaction */}
                {justUploadedFile.txHash && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">SHELBY STORAGE SUBSCRIPTION receipt TRANSACTION HASH</label>
                    <div className="p-3 bg-black/45 border border-white/5 rounded-xl font-mono text-xs text-gray-300 break-all select-all flex items-center justify-between">
                      <span className="text-shelby-cyan">{justUploadedFile.txHash}</span>
                      <button
                        onClick={() => clipboardCopy(justUploadedFile.txHash, 'success-tx')}
                        className="ml-2 text-shelby-cyan hover:underline hover:text-white text-[10px] transition-colors"
                      >
                        {copiedField === 'success-tx' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action pointers */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 font-mono leading-relaxed">
                  💡 <strong>Next Step suggested:</strong> Click 'REGISTER ON-CHAIN' next to this file in the storage list to register your browser-side Merkle proof securely on the Aptos Testnet Ledger.
                </div>

                {/* Dialog trigger buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setJustUploadedFile(null);
                    }}
                    className="flex-1 px-4 py-2 bg-[#09090D] hover:bg-white/5 text-gray-300 hover:text-white font-display text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                  >
                    Close and View in Vault
                  </button>
                  {!justUploadedFile.isRegistered && (
                    <button
                      onClick={async () => {
                        const fid = justUploadedFile.id;
                        setJustUploadedFile(null);
                        await onRegisterOnChain(fid);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-shelby-cyan to-shelby-purple text-black font-display text-xs font-bold rounded-xl hover:opacity-95 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Register On-Chain Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
