import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}

import { aptosClient, COIN_TYPES } from "./networkConfig";

export const aptos = aptosClient;

/**
 * Interface representing live fetched balances from the Shelby Devnet chain.
 */
export interface OnChainBalances {
  aptBalance: number;
  shelbyUsdBalance: number;
  activeOnChain: boolean;
  rawResources: any[];
}

/**
 * Fetches real-time, decrypted balances directly from the Shelby Devnet blockchain.
 * Uses getAccountCoinAmount for high-fidelity coin retrieval as requested.
 * Handles "account not found" scenario gracefully.
 */
export async function fetchOnChainBalances(address: string): Promise<OnChainBalances> {
  if (!address || !address.startsWith("0x")) {
    return { aptBalance: 0, shelbyUsdBalance: 0, activeOnChain: false, rawResources: [] };
  }

  try {
    // 1. Fetch APT balance using getAccountCoinAmount
    let rawApt = 0;
    try {
      rawApt = await aptos.getAccountCoinAmount({
        accountAddress: address,
        coinType: "0x1::aptos_coin::AptosCoin"
      });
    } catch (e) {
      try {
        rawApt = await aptos.getAccountCoinAmount({
          accountAddress: address,
          coinType: "0xa::aptos_coin::AptosCoin"
        });
      } catch (e2) {
        console.warn("APT balance lookup failed via getAccountCoinAmount (both 0x1 and 0xa):", e2);
      }
    }
    const aptBalance = rawApt / 100_000_000; // 8 decimals standard for Aptos Coin

    // 2. Fetch ShelbyUSD token balance using getAccountCoinAmount
    let rawShelby = 0;
    try {
      rawShelby = await aptos.getAccountCoinAmount({
        accountAddress: address,
        coinType: "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD"
      });
    } catch (e) {
      console.warn("ShelbyUSD balance lookup failed via getAccountCoinAmount:", e);
    }
    const shelbyUsdBalance = rawShelby / 1_000_000; // 6 decimals standard for ShelbyUSD

    let resources: any[] = [];
    try {
      resources = await aptos.getAccountResources({ accountAddress: address });
    } catch (e) {
      // Ignore if account has no resources initialized yet
    }

    return {
      aptBalance,
      shelbyUsdBalance,
      activeOnChain: resources.length > 0,
      rawResources: resources
    };

  } catch (error: any) {
    console.warn("Shelby Devnet balance query exception handled:", error.message || error);
    return {
      aptBalance: 0,
      shelbyUsdBalance: 0,
      activeOnChain: false,
      rawResources: []
    };
  }
}
