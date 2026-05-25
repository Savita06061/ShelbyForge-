import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Initialize the Aptos client for Testnet
const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

/**
 * Interface representing live fetched balances from the Aptos Testnet chain.
 */
export interface OnChainBalances {
  aptBalance: number;
  shelbyUsdBalance: number;
  activeOnChain: boolean;
  rawResources: any[];
}

/**
 * Fetches real-time, decrypted balances directly from the Aptos blockchain.
 * Handles "account not found" scenario gracefully.
 */
export async function fetchOnChainBalances(address: string): Promise<OnChainBalances> {
  if (!address || !address.startsWith("0x")) {
    return { aptBalance: 0, shelbyUsdBalance: 0, activeOnChain: false, rawResources: [] };
  }

  try {
    const resources = await aptos.getAccountResources({ accountAddress: address });

    let aptBalance = 0;
    let shelbyUsdBalance = 0;

    // Retrieve standard APT Coin balance representation from the Aptos ledger resources array
    const aptSore = resources.find(
      (r: any) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    if (aptSore && aptSore.data && (aptSore.data as any).coin) {
      const val = parseInt((aptSore.data as any).coin.value);
      aptBalance = val / 100_000_000; // 8 decimals standard for Aptos Coin
    }

    // Locate any ShelbyUSD or secondary testnet custom tokens in the client account CoinStore
    const shelbyStore = resources.find((r: any) => {
      const typeStr = String(r.type);
      return (
        typeStr.includes("shelby_coin::ShelbyUSD") || 
        typeStr.includes("ShelbyUSD") || 
        typeStr.includes("shelby") || 
        typeStr.includes("ShelbyCoin")
      );
    });

    if (shelbyStore && shelbyStore.data && (shelbyStore.data as any).coin) {
      const val = parseInt((shelbyStore.data as any).coin.value);
      // Assume 6 decimals for standard custom coin representation or fall back to 8 decimals
      const decimals = String(shelbyStore.type).toLowerCase().includes("shelbyusd") ? 6 : 8;
      shelbyUsdBalance = val / Math.pow(10, decimals);
    } else {
      // If they are on a real wallet connected to Testnet, but lack the custom token CoinStore,
      // we check for other popular Testnet USD wrappers or fallback to the sandbox representation
      const genericUsdCoin = resources.find((r: any) => {
        const lowerType = String(r.type).toLowerCase();
        return (lowerType.includes("usdc") || lowerType.includes("usdt") || lowerType.includes("usd"));
      });
      if (genericUsdCoin && genericUsdCoin.data && (genericUsdCoin.data as any).coin) {
        const val = parseInt((genericUsdCoin.data as any).coin.value);
        shelbyUsdBalance = val / 1_000_000; // standard 6 decimals for USD stability wrappers
      } else {
        // Fallback placeholder representation for premium sandbox representational fidelity
        shelbyUsdBalance = 0;
      }
    }

    return {
      aptBalance,
      shelbyUsdBalance,
      activeOnChain: true,
      rawResources: resources
    };

  } catch (error: any) {
    // If account has no resources, it has never been funded/registered on Aptos Testnet
    const errMessage = String(error.message || error);
    const isAccountNotFound = errMessage.includes("account_not_found") || errMessage.includes("404") || errMessage.includes("not found");
    
    console.warn("Aptos on-chain balance query exception handled:", errMessage);
    
    return {
      aptBalance: 0,
      shelbyUsdBalance: 0,
      activeOnChain: !isAccountNotFound,
      rawResources: []
    };
  }
}
