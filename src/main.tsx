import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AptosWalletAdapterProvider 
      autoConnect={true}
      dappConfig={{
        network: Network.CUSTOM,
        aptosConfig: {
          fullnode: "https://api.shelbynet.shelby.xyz/v1",
          indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
        }
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </StrictMode>,
);
