import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { SHELBY_DEVNET_FULLNODE, SHELBY_DEVNET_INDEXER } from './utils/networkConfig.ts';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AptosWalletAdapterProvider 
      autoConnect={true}
      dappConfig={{
        network: Network.CUSTOM,
        aptosConfig: {
          fullnode: SHELBY_DEVNET_FULLNODE,
          indexer: SHELBY_DEVNET_INDEXER
        }
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </StrictMode>,
);
