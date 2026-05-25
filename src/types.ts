/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShelbyFile {
  id: string;
  name: string;
  size: number;
  type: string;
  sha256: string;
  merkleRoot: string;
  merkleProof: string[];
  uploadedAt: string;
  isRegistered: boolean;
  isPublic: boolean;
  txHash: string;
  chunkCount: number;
  integrityScore: number;
  shelbyStorageNode: string;
  downloadUrl: string;
}

export interface ActivityLog {
  id: string;
  type: 'forge' | 'register' | 'toggle_privacy' | 'faucet' | 'wallet';
  description: string;
  timestamp: string;
  txHash?: string;
  status: 'success' | 'pending' | 'failed';
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number; // APT
  shelbyUsdBalance: number; // ShelbyUSD custom fee currency
  walletType: 'petra' | 'burner' | 'custom' | null;
}

export interface ForgeStats {
  totalFilesSecured: number;
  totalStorageSecured: number; // in bytes
  proofsRegistered: number;
  averageIntegrity: number;
  nodeLatency: number; // ms
  gasSaved: number; // APT
}
