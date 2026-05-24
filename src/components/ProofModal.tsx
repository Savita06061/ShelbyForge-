/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShelbyFile } from '../types';
import { X, Copy, Check, ShieldCheck, Database, Link, ExternalLink, Cpu } from 'lucide-react';

interface ProofModalProps {
  file: ShelbyFile | null;
  onClose: () => void;
}

export default function ProofModal({ file, onClose }: ProofModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!file) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getReadableSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#030303]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden glass-panel-neon rounded-2xl p-6 text-gray-200 shadow-2xl z-10 font-sans"
        >
          {/* Header Glow accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-shelby-cyan via-shelby-purple to-shelby-cyan" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-shelby-cyan/10 border border-shelby-cyan/30 text-shelby-cyan">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight text-white">Cryptographic Forge Vault Proof</h3>
              <p className="text-xs text-gray-400">Verifiable storage manifest verified via Aptos Testnet ledger</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* File Info Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 font-mono">FILE PROFILE</p>
                <h4 className="font-medium text-white break-all">{file.name}</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Size: <span className="font-bold text-white font-mono">{getReadableSize(file.size)}</span> • Type: <span className="text-white">{file.type || 'Unknown'}</span>
                </p>
              </div>
              <div className="sm:text-right flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono">FORGE DATE</p>
                <p className="text-sm font-mono text-white mt-0.5">
                  {new Date(file.uploadedAt).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center sm:justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Integrity: {file.integrityScore}%</span>
                </div>
              </div>
            </div>

            {/* SHA-256 and Merkle Root details */}
            <div className="space-y-3">
              {/* File SHA-256 Hash */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-shelby-cyan" />
                    FILE SHA-256 CRYPTOGRAPHIC HASH
                  </label>
                  <button
                    onClick={() => copyToClipboard(file.sha256, 'sha256')}
                    className="text-xs text-shelby-cyan hover:underline hover:text-shelby-cyan/80 flex items-center gap-1 font-mono transition-all"
                  >
                    {copiedField === 'sha256' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#030303] border border-white/5 font-mono text-xs text-gray-300 break-all select-all">
                  {file.sha256}
                </div>
              </div>

              {/* Merkle Root */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-shelby-purple" />
                    SHELBY ROOT MERKLE ROOT
                  </label>
                  <button
                    onClick={() => copyToClipboard(file.merkleRoot, 'merkleRoot')}
                    className="text-xs text-shelby-purple hover:underline hover:text-shelby-purple/80 flex items-center gap-1 font-mono transition-all"
                  >
                    {copiedField === 'merkleRoot' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Root</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#030303] border border-white/5 font-mono text-xs text-gray-300 break-all select-all">
                  {file.merkleRoot}
                </div>
              </div>
            </div>

            {/* Verification Siblings Path */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-mono">MERKLE TREE VALIDATION PATHWAY (In-Browser Proof)</label>
              <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 font-mono text-xs text-gray-400 space-y-1">
                {file.merkleProof.map((sibling, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-white/[0.02] last:border-0">
                    <span>Sibling Node [{idx}]:</span>
                    <span className="text-white text-right break-all ml-4">{sibling}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* On-Chain Aptos Status and Shelby Storage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shelby Storage Allocation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <h5 className="text-[10px] text-gray-500 font-mono tracking-wider">SHELBY STORAGE NODE</h5>
                  <p className="text-sm font-medium text-white mt-1 break-all font-mono">{file.shelbyStorageNode}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-between items-center">
                  <span className="text-xs text-gray-400">Status: Secure Chunked</span>
                  <span className="text-xs font-bold text-shelby-cyan font-mono">{file.chunkCount} Chunks</span>
                </div>
              </div>

              {/* On-Chain Aptos Registry */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <h5 className="text-[10px] text-gray-500 font-mono tracking-wider">APTOS TESTNET TRANSACTION</h5>
                  {file.isRegistered ? (
                    <p className="text-xs font-mono text-shelby-cyan mt-1 break-all">{file.txHash}</p>
                  ) : (
                    <p className="text-xs text-amber-400 font-medium mt-1">Pending Registration on-chain...</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-between items-center">
                  <span className="text-xs text-gray-400">On-Chain Ledger Status</span>
                  {file.isRegistered ? (
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${file.txHash}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-shelby-cyan hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-amber-400">Action Required</span>
                  )}
                </div>
              </div>
            </div>

            {/* Public Link Share Row */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${file.isPublic ? 'bg-shelby-cyan animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-sm text-gray-300">
                  Vault Privacy: <strong className="text-white">{file.isPublic ? 'Publicly Verifiable' : 'Private (Encrypted/Hidden)'}</strong>
                </span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?verify=${file.id}`;
                    copyToClipboard(shareUrl, 'shareLink');
                  }}
                  className="flex-1 sm:flex-none border border-white/15 bg-white/5 hover:bg-white/10 active:bg-white/5 font-display text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-all flex items-center justify-center gap-2"
                >
                  <Link className="w-4 h-4 text-shelby-cyan" />
                  <span>{copiedField === 'shareLink' ? 'Copied Share Link!' : 'Copy Share Link'}</span>
                </button>

                <a
                  href={file.downloadUrl}
                  download={file.name}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-shelby-cyan to-shelby-purple font-display text-xs font-bold px-4 py-2.5 rounded-xl text-black hover:opacity-90 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Download File</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
