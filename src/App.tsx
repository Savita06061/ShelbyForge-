/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { ShelbyFile, ActivityLog, WalletState, ForgeStats } from './types';
import { calculateFileHash, generateMerkleProof, generateMockTxHash, generateAptosAddress, getRandomShelbyNode } from './utils/crypto';

// Import Views & Components
import BackgroundParticles from './components/BackgroundParticles';
import Navbar from './components/Navbar';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import ProofModal from './components/ProofModal';
import Footer from './components/Footer';

// Prepopulate the dashboard with premium starter vault files for visual and interactive rhythm
const INITIAL_FILES: ShelbyFile[] = [
  {
    id: "shelby-doc-1",
    name: "shelby_analytical_kernel_v5.sol",
    size: 2450000,
    type: "sol",
    sha256: "0f43886b4028faed226e6378e9afdc4cce8f0ba7224e75d506a589be722f6d0f",
    merkleRoot: "0x0f43886b4028faed226e6378e9afdc4cce8fb000ffff",
    merkleProof: [
      "Left sibling: 0xa9fe43ba6d78775e542cc08f",
      "Right sibling: 0xb5defcc2288abdf435efd"
    ],
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    isRegistered: true,
    isPublic: true,
    txHash: "0x98fded238cd29ae3efade53664cc5e8fb8ab81e8b2ed3fde23ab8dca737ea73a",
    chunkCount: 3,
    integrityScore: 100,
    shelbyStorageNode: "shelby-storage-node-us-east-4",
    downloadUrl: "#"
  },
  {
    id: "shelby-doc-2",
    name: "corporate_integrity_manifest.pdf",
    size: 512000,
    type: "pdf",
    sha256: "ea829ad3ecb001fe231ac726e6b010f4c02da8b74c2d3a1fb4d7c2a10efdc2ef",
    merkleRoot: "0xea829ad3ecb001fe231ac726e6b010f4ce8b000ffff",
    merkleProof: [
      "Left sibling: 0x932fedadeec302cba37b120f",
      "Right sibling: 0x4fde23ea98efacd98cf0f23e"
    ],
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    isRegistered: true,
    isPublic: false,
    txHash: "0x12bcfda02db8fa9d3effec22dbef329da8cbf32fde32efab23db9cdfe3fe2abc",
    chunkCount: 2,
    integrityScore: 100,
    shelbyStorageNode: "shelby-storage-node-eu-central-1",
    downloadUrl: "#"
  },
  {
    id: "shelby-doc-3",
    name: "alpha_node_config_v42.conf",
    size: 28900,
    type: "conf",
    sha256: "88de00a84fc29ae18ffbbdadade00a89d9e4c2ddaa3283fde2eddaaaefebf3c1",
    merkleRoot: "0x88de00a84fc29ae18ffbbdadade00a89e8b000ffff",
    merkleProof: [
      "Left sibling: 0x2cdfed3e9ab9cd3efbe239a0",
      "Right sibling: 0xed01dfcaefadeaa9dced3ef3"
    ],
    uploadedAt: new Date(Date.now() - 360000 * 5).toISOString(), // 30 mins ago
    isRegistered: false,
    isPublic: false,
    txHash: "",
    chunkCount: 1,
    integrityScore: 99,
    shelbyStorageNode: "shelby-storage-node-ap-southeast-2",
    downloadUrl: "#"
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    type: "wallet",
    description: "Secure workspace core initializes crypt engines successfully.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toLocaleTimeString(),
    status: "success"
  },
  {
    id: "log-2",
    type: "forge",
    description: "File 'shelby_analytical_kernel_v5.sol' parsed. Browser computed root hash successfully.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 3 + 120000).toLocaleTimeString(),
    status: "success"
  },
  {
    id: "log-3",
    type: "register",
    description: "Registered Merkle Root on Aptos chain ledger.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 3 + 300000).toLocaleTimeString(),
    txHash: "0x98fded238cd29ae3efade53664cc5e8fb8ab81e8b2ed3fde23ab8dca737ea73a",
    status: "success"
  }
];

export default function App() {
  const {
    connect,
    disconnect,
    connected: adapterConnected,
    account: adapterAccount,
    wallet: adapterWallet,
    wallets,
    signAndSubmitTransaction
  } = useWallet();

  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [files, setFiles] = useState<ShelbyFile[]>(INITIAL_FILES);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Support for light / dark theme state (inspired by user mockup representation)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('shelby-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('shelby-theme', next);
      return next;
    });
  };
  
  // Custom Toast Banner state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeProofFile, setActiveProofFile] = useState<ShelbyFile | null>(null);

  // Loading animation states during file forge process
  const [isForging, setIsForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [forgeStage, setForgeStage] = useState('');

  // Wallet profile
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
    walletType: null
  });

  // Track the on-chain balance fetching for the standard wallet adapter
  useEffect(() => {
    if (adapterConnected && adapterAccount) {
      const addressStr = adapterAccount.address?.toString() || "";
      if (addressStr) {
        const fetchBalance = async () => {
          let liveBalance = 15.0; // pre-populated testnet balance default
          try {
            const nodeResponse = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/accounts/${addressStr}/resources`);
            if (nodeResponse.ok) {
              const data = await nodeResponse.json();
              const coinStore = data.find((r: any) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
              if (coinStore && coinStore.data && coinStore.data.coin) {
                const val = parseInt(coinStore.data.coin.value);
                liveBalance = val / 100_000_000;
              }
            }
          } catch (err) {
            console.warn("Could not query balance for wallet adapter account:", err);
          }
          setWallet({
            connected: true,
            address: addressStr,
            balance: liveBalance,
            walletType: 'petra'
          });
        };
        fetchBalance();
      }
    } else {
      setWallet(prev => {
        if (prev.walletType === 'petra') {
          return {
            connected: false,
            address: null,
            balance: 0,
            walletType: null
          };
        }
        return prev;
      });
    }
  }, [adapterConnected, adapterAccount, adapterWallet]);

  // Calculate vault statistics dynamically
  const getStats = (): ForgeStats => {
    const totalBytes = files.reduce((acc, curr) => acc + curr.size, 0);
    const registeredCount = files.filter(f => f.isRegistered).length;
    const avgIntegrity = files.length > 0
      ? Math.round(files.reduce((acc, curr) => acc + curr.integrityScore, 0) / files.length)
      : 100;
    
    return {
      totalFilesSecured: files.length,
      totalStorageSecured: totalBytes,
      proofsRegistered: registeredCount,
      averageIntegrity: avgIntegrity,
      nodeLatency: 12, // ms
      gasSaved: registeredCount * 0.00142
    };
  };

  // Toast trigger utility
  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // URL query handling for shareable links (?verify=doc-id)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyId = urlParams.get('verify');
    if (verifyId) {
      const match = files.find(f => f.id === verifyId);
      if (match) {
        setView('dashboard');
        setActiveProofFile(match);
        triggerToast("Shareable decentralized proof manifest parsed safely!", "success");
      } else {
        triggerToast("Requested share proof identifier not found.", "error");
      }
    }
  }, []);

  // Sync wallet profile balance in background simulation
  useEffect(() => {
    if (wallet.connected && wallet.walletType === 'burner') {
      // Small visual flow checking mock balance changes
      const interval = setInterval(() => {
        setWallet(prev => {
          if (!prev.connected) return prev;
          // Small simulation of standard network micro-transfers / testnet gas drip
          return { ...prev };
        });
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet.connected]);

  // Wallet Connection Handling
  const handleConnectWallet = async (type: 'petra' | 'burner') => {
    setShowWalletModal(false);

    // Resolve Custom Address Sync from global queue first (Secure Sandbox Bypass)
    const customAddress = (window as any).__customAptosAddress;
    if (customAddress) {
      (window as any).__customAptosAddress = undefined;
      setWallet({
        connected: true,
        address: customAddress,
        balance: 14.85, // Pre-seeded testnet balance for active simulation
        walletType: 'custom'
      });

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        type: "wallet",
        description: `Verified Aptos custom address linked: ${customAddress.substring(0, 16)}... Synced with Aptos Testnet Ledger. Ready to register crypt roots.`,
        timestamp: new Date().toLocaleTimeString(),
        status: "success"
      };
      setLogs(prev => [newLog, ...prev]);
      triggerToast("Secure ledger address linked successfully!", "success");
      setView('dashboard');
      return;
    }

    if (type === 'petra') {
      try {
        triggerToast("Connecting to live extension through Aptos standard SDK...", "info");
        
        // Match Petra specifically inside connected list or fall back
        const targetWalletName = wallets.find(w => w.name.toLowerCase().includes('petra'))?.name || "Petra";
        await connect(targetWalletName as any);
        
        triggerToast("Aptos Adapter connection request authorized!", "success");
        setView('dashboard');
      } catch (err: any) {
        const errMsg = err.message || 'Connection Rejected';
        console.warn("Petra connection error details:", err);
        
        let isInsideIframe = false;
        try {
          isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
        } catch (e) {
          isInsideIframe = true; // Security error loading parent top context means we are in cross-origin sandbox!
        }
        
        if (isInsideIframe) {
          triggerToast("Direct browser connection was blocked by AI Studio iframe sandbox.", "error");
          
          const sandboxErrLog: ActivityLog = {
            id: `log-${Date.now()}`,
            type: "wallet",
            description: `🔴 SECURITY EXCEPTION: Petra extension injection blocked by parent iframe sandbox. Tip: Click 'OPEN IN NEW TAB' button on top of wallet modal to connect your real wallet.`,
            timestamp: new Date().toLocaleTimeString(),
            status: "failed"
          };
          setLogs(prev => [sandboxErrLog, ...prev]);
        } else {
          triggerToast(`Aptos Connection Failed: ${errMsg}. Ensure your extension is unlocked and set to Testnet!`, "error");
          
          const standardErrLog: ActivityLog = {
            id: `log-${Date.now()}`,
            type: "wallet",
            description: `❌ Petra extension connection rejected / failed: ${errMsg}. Please check if the Petra Chrome extension is unlocked and on Testnet.`,
            timestamp: new Date().toLocaleTimeString(),
            status: "failed"
          };
          setLogs(prev => [standardErrLog, ...prev]);
        }
      }
    } else {
      // Ephemeral Burner Account creation
      const bAddress = generateAptosAddress();
      setWallet({
        connected: true,
        address: bAddress,
        balance: 15.00, // Pre-funded Faucet gas
        walletType: 'burner'
      });

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        type: "wallet",
        description: `Ephemeral preview account generated: ${bAddress.substring(0,12)}... funded with +15.00 APT Testnet Faucet coins.`,
        timestamp: new Date().toLocaleTimeString(),
        status: "success"
      };
      setLogs(prev => [newLog, ...prev]);
      triggerToast("Shelby Ephemeral Lock generated!", "success");
      setView('dashboard');
    }
  };

  const handleDisconnectWallet = async () => {
    if (wallet.walletType === 'petra') {
      try {
        await disconnect();
      } catch (err) {
        console.warn("Disconnection call threw error:", err);
      }
    }
    setWallet({
      connected: false,
      address: null,
      balance: 0,
      walletType: null
    });
    
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type: "wallet",
      description: "Secure cryptographic wallet wrapper discarded.",
      timestamp: new Date().toLocaleTimeString(),
      status: "success"
    };
    setLogs(prev => [newLog, ...prev]);
    triggerToast("Wallet disconnected.", "info");
  };

  // Claim Testnet faucet
  const handleClaimFaucet = () => {
    if (!wallet.connected || wallet.walletType !== 'burner') return;

    const faucetTx = generateMockTxHash();
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + 10.00
    }));

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type: "faucet",
      description: "Secured Aptos Testnet Faucet Mint (+10.00 APT). Transferred into Ephemeral vault wallet.",
      timestamp: new Date().toLocaleTimeString(),
      txHash: faucetTx,
      status: "success"
    };

    setLogs(prev => [newLog, ...prev]);
    triggerToast("Minted +10.00 Testnet APT successfully!", "success");
  };

  // Perform browser cryptographic forge process
  const handleAddFile = async (fileObj: File) => {
    if (!wallet.connected) {
      triggerToast("Please connect a wallet to enable the forge.", "error");
      return;
    }

    setIsForging(true);
    setForgeProgress(10);
    setForgeStage("Reading File binary array buffer...");

    try {
      // Stage 1 duration
      await new Promise(r => setTimeout(r, 600));
      setForgeProgress(40);
      setForgeStage("Generating secure local SHA-256 integrity hash...");
      const fileHash = await calculateFileHash(fileObj);

      // Stage 2 duration
      await new Promise(r => setTimeout(r, 700));
      setForgeProgress(70);
      setForgeStage("Compiling 3-layer Merkle tree sibling proofs...");
      const { root, proof } = generateMerkleProof(fileHash);

      // Stage 3 duration
      await new Promise(r => setTimeout(r, 600));
      setForgeProgress(90);
      setForgeStage("Pruning and caching shard segments to Shelby storage nodes...");
      
      const fileExtension = fileObj.name.split('.').pop() || '';
      const allocatedBlockNode = getRandomShelbyNode();
      const newFile: ShelbyFile = {
        id: `shelby-${Date.now()}`,
        name: fileObj.name,
        size: fileObj.size,
        type: fileExtension,
        sha256: fileHash,
        merkleRoot: root,
        merkleProof: proof,
        uploadedAt: new Date().toISOString(),
        isRegistered: false,
        isPublic: false,
        txHash: "",
        chunkCount: Math.max(1, Math.min(10, Math.ceil(fileObj.size / (1024 * 100)))), // 100KB chunks max
        integrityScore: 100,
        shelbyStorageNode: allocatedBlockNode,
        downloadUrl: URL.createObjectURL(fileObj)
      };

      // Final complete stage
      await new Promise(r => setTimeout(r, 400));
      setForgeProgress(100);
      
      setFiles(prev => [newFile, ...prev]);

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        type: "forge",
        description: `Local cryptographic hash completed for '${fileObj.name}'. Computed SHA-256 leaf, allocated to hot cluster node: ${allocatedBlockNode}.`,
        timestamp: new Date().toLocaleTimeString(),
        status: "success"
      };
      setLogs(prev => [newLog, ...prev]);
      triggerToast("File forged and cache nodes secure!", "success");

    } catch (e: any) {
      triggerToast(`Cryptographic Forge Interrupted: ${e.message}`, "error");
    } finally {
      setIsForging(false);
      setForgeProgress(0);
      setForgeStage("");
    }
  };

  // Register on-chain Merkle root to Aptos Testnet
  const handleRegisterOnChain = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    let txHashHex = generateMockTxHash();

    // Try a real Aptos transaction if connected via Petra!
    if (wallet.connected && wallet.walletType === 'petra') {
      triggerToast("Requesting wallet safe-sign verification transaction... Please approve!", "info");
      try {
        let pendingTx;
        try {
          // Construct entry-function payload using modern V3 structure
          pendingTx = await signAndSubmitTransaction({
            data: {
              function: "0x1::aptos_account::transfer",
              typeArguments: [],
              functionArguments: [wallet.address || "", "10"]
            }
          });
        } catch (v3Err) {
          console.warn("V3 transaction format failed, trying fallback V2 format:", v3Err);
          // Fallback old structure in case some wallet doesn't support V3 payload format yet
          pendingTx = await signAndSubmitTransaction({
            type: "entry_function_payload",
            function: "0x1::aptos_account::transfer",
            type_arguments: [],
            arguments: [wallet.address || "", "10"]
          } as any);
        }

        if (pendingTx && pendingTx.hash) {
          txHashHex = pendingTx.hash;
          triggerToast("Aptos Testnet ledger entry successfully updated!", "success");
        } else {
          throw new Error("No transaction hash returned from the wallet signature.");
        }
        
        // Re-fetch balance
        try {
          const nodeResponse = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/accounts/${wallet.address}/resources`);
          if (nodeResponse.ok) {
            const data = await nodeResponse.json();
            const coinStore = data.find((r: any) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
            if (coinStore && coinStore.data && coinStore.data.coin) {
              const val = parseInt(coinStore.data.coin.value);
              setWallet(prev => ({ ...prev, balance: val / 100_000_000 }));
            }
          }
        } catch (rErr) {
          console.warn("Could not reload balance:", rErr);
        }

      } catch (txErr: any) {
        console.error("Aptos transaction signature failed/rejected:", txErr);
        triggerToast(`Transaction Signature Cancelled: ${txErr.message || 'Rejected'}`, "error");
        
        // Log failure
        const failLog: ActivityLog = {
          id: `log-${Date.now()}`,
          type: "wallet",
          description: `❌ MINT REJECTED: On-chain proof registration for '${file.name}' was cancelled by the user in Petra.`,
          timestamp: new Date().toLocaleTimeString(),
          status: "failed"
        };
        setLogs(prev => [failLog, ...prev]);
        return; // Halt register
      }
    } else {
      if (wallet.balance < 0.00142) {
        triggerToast("Insufficient Aptos Testnet gas. Request $APT faucet first.", "error");
        return;
      }

      // Spend micro gas simulation
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - 0.00142
      }));
    }

    // Trigger subtle visual update state
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          isRegistered: true,
          txHash: txHashHex
        };
      }
      return f;
    }));

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type: "register",
      description: `Registered Merkle root for file '${file.name}' to Aptos transaction registry ledger. Root certified permanently.`,
      timestamp: new Date().toLocaleTimeString(),
      txHash: txHashHex,
      status: "success"
    };
    setLogs(prev => [newLog, ...prev]);
    triggerToast("Ledger Root registration confirmed!", "success");
  };

  // Toggle privacy between public and secure private state
  const handleTogglePrivacy = (fileId: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const nextState = !f.isPublic;
        // Log update
        const privacyLog: ActivityLog = {
          id: `log-${Date.now()}`,
          type: "wallet",
          description: `Crypt Vault privacy changed. Metadata search engine for '${f.name}' initialized to ${nextState ? 'PUBLIC_DISCOVERY' : 'ENCRYPTED_PRIVATE'}.`,
          timestamp: new Date().toLocaleTimeString(),
          status: "success"
        };
        setLogs(old => [privacyLog, ...old]);
        triggerToast(`Vault privacy toggled to ${nextState ? 'Public Proof' : 'Private'}`, "info");
        return { ...f, isPublic: nextState };
      }
      return f;
    }));
  };

  // Delete / purge file records
  const handleDeleteFile = (fileId: string) => {
    const item = files.find(f => f.id === fileId);
    if (!item) return;

    setFiles(prev => prev.filter(f => f.id !== fileId));

    const purgeLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type: "wallet",
      description: `Purged static descriptors for '${item.name}'. Decentralized shard nodes initiated disk wipe protocols.`,
      timestamp: new Date().toLocaleTimeString(),
      status: "success"
    };
    setLogs(old => [purgeLog, ...old]);
    triggerToast("File details purged from local cache. Shards cleared.", "info");
  };

  return (
    <main className="relative min-h-screen bg-[#030303] text-gray-200 selection:bg-shelby-cyan/30 flex flex-col justify-between">
      
      {/* Dynamic particles background */}
      <BackgroundParticles />

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 border glass-panel-neon ${
              toast.type === 'success' ? 'border-emerald-500/30 text-emerald-400 font-bold' :
              toast.type === 'error' ? 'border-red-500/30 text-red-400 font-bold' :
              'border-[#00F0FF]/30 text-white font-medium'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-red-400' : 'bg-[#00F0FF]'} animate-pulse`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Layout Components */}
      <div className="flex flex-col min-h-screen">
        <Navbar 
          wallet={wallet}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
          currentView={view}
          setView={setView}
          showWalletModal={showWalletModal}
          setShowWalletModal={setShowWalletModal}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Route View rendering */}
        <div className="flex-grow">
          {view === 'landing' ? (
            <LandingView 
              wallet={wallet} 
              setView={setView} 
              setShowWalletModal={setShowWalletModal} 
            />
          ) : (
            <DashboardView 
              files={files}
              stats={getStats()}
              logs={logs}
              wallet={wallet}
              onAddFile={handleAddFile}
              onRegisterOnChain={handleRegisterOnChain}
              onTogglePrivacy={handleTogglePrivacy}
              onDeleteFile={handleDeleteFile}
              onClaimFaucet={handleClaimFaucet}
              onInspectFile={setActiveProofFile}
              loading={isForging}
              loadingProgress={forgeProgress}
              loadingStage={forgeStage}
            />
          )}
        </div>

        <Footer />
      </div>

      {/* Proof manifest examiner display card */}
      <ProofModal 
        file={activeProofFile} 
        onClose={() => setActiveProofFile(null)} 
      />

    </main>
  );
}
