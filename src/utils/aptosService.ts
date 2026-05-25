import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Initialize the Aptos client for Shelby Devnet (shelbynet)
const config = new AptosConfig({ 
  network: Network.CUSTOM,
  fullnode: "https://api.shelbynet.shelby.xyz/v1",
  indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
});
export const aptos = new Aptos(config);

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
      console.warn("APT balance lookup failed via getAccountCoinAmount:", e);
    }
    const aptBalance = rawApt / 100_000_000; // 8 decimals standard for Aptos Coin

    // 2. Fetch ShelbyUSD token balance using getAccountCoinAmount
    let rawShelby = 0;
    try {
      rawShelby = await aptos.getAccountCoinAmount({
        accountAddress: address,
        coinType: "0x5eb1ea47b3117aec5b66d6d2b6eb2ba806a6b5790d984cfb395dae822aefea73::shelby_coin::ShelbyUSD"
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
