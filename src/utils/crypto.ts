/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates the authentic SHA-256 hash of a file using standard Web Crypto API.
 */
export async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file buffer"));
          return;
        }
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File reading error"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates a clean web-ready Merkle Proof and Root for a single file hash.
 * This simulates a 3-layer Merkle Tree to show real Web3 verification pathways.
 */
export function generateMerkleProof(fileHash: string): { root: string; proof: string[] } {
  // Let's create visual mock sibling nodes for the presentation layer
  const sibling1 = "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "..." + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const sibling2 = "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "..." + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  
  // Create a pseudo-root representing Root = Hash(Hash(Hash(file, sibling1), sibling2))
  const rootHex = "0x" + fileHash.substring(0, 32) + "e8b0" + fileHash.substring(40, 60) + "00ff";
  
  return {
    root: rootHex,
    proof: [
      `Left sibling: ${sibling1}`,
      `Right sibling: ${sibling2}`
    ]
  };
}

/**
 * Generates an authentic looking Aptos Transaction Hash.
 */
export function generateMockTxHash(): string {
  const characters = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += characters[Math.floor(Math.random() * characters.length)];
  }
  return hash;
}

/**
 * Generates an custom Aptos address representation.
 */
export function generateAptosAddress(): string {
  const characters = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 64; i++) {
    address += characters[Math.floor(Math.random() * characters.length)];
  }
  return address;
}

/**
 * Helper to generate mock peer-to-peer storage node allocation
 */
export function getRandomShelbyNode(): string {
  const nodes = [
    'shelby-storage-node-us-east-4',
    'shelby-storage-node-eu-central-1',
    'shelby-storage-node-ap-southeast-2',
    'shelby-storage-node-global-anycast-8'
  ];
  return nodes[Math.floor(Math.random() * nodes.length)];
}
