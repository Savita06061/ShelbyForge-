import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';

// Buffer Polyfill
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from '@aptos-labs/wallet-adapter-wallets';
import { AptosConfig } from '@aptos-labs/ts-sdk';

import App from './App.tsx';
import './index.css';

// Shelby Devnet Config
const aptosConfig = new AptosConfig({
  network: "custom" as any,
  fullnode: "https://api.shelbynet.shelby.xyz/v1",
  indexer: "https://api.shelbynet.shelby.xyz/v1/graphql",
});

const wallets = [new PetraWallet()];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      dappConfig={{
        network: aptosConfig.network,
        aptosConfig: aptosConfig,
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </StrictMode>,
);
