import { Network, AptosConfig, Aptos } from "@aptos-labs/ts-sdk";

export const SHELBY_DEVNET_FULLNODE = "https://api.shelbynet.shelby.xyz/v1";
export const SHELBY_DEVNET_INDEXER = "https://api.shelbynet.shelby.xyz/v1/graphql";

export const COIN_TYPES = {
  APT: "0x1::aptos_coin::AptosCoin",
  APT_ALTERNATIVE: "0xa::aptos_coin::AptosCoin",
  ShelbyUSD: "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD",
} as const;

// Config for Aptos SDK initialization
export const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: SHELBY_DEVNET_FULLNODE,
  indexer: SHELBY_DEVNET_INDEXER,
});

// Singleton Aptos Client
export const aptosClient = new Aptos(aptosConfig);

// Helper to get Aptos client dynamically
export function getDynamicAptosClient(networkNameOrUrl?: string): Aptos {
  if (!networkNameOrUrl) {
    return aptosClient;
  }
  const norm = networkNameOrUrl.toLowerCase();
  
  let fullnode = SHELBY_DEVNET_FULLNODE;
  let indexer = SHELBY_DEVNET_INDEXER;
  let networkType = Network.CUSTOM;

  if (norm.includes("testnet") || norm === "testnet") {
    fullnode = "https://fullnode.testnet.aptoslabs.com/v1";
    indexer = "https://indexer.testnet.aptoslabs.com/v1/graphql";
    networkType = Network.TESTNET;
  } else if (norm.includes("devnet") || norm === "devnet") {
    fullnode = "https://fullnode.devnet.aptoslabs.com/v1";
    indexer = "https://indexer.devnet.aptoslabs.com/v1/graphql";
    networkType = Network.DEVNET;
  } else if (norm.includes("mainnet") || norm === "mainnet") {
    fullnode = "https://fullnode.mainnet.aptoslabs.com/v1";
    indexer = "https://indexer.mainnet.aptoslabs.com/v1/graphql";
    networkType = Network.MAINNET;
  }

  const config = new AptosConfig({
    network: networkType,
    fullnode,
    indexer,
  });
  return new Aptos(config);
}

// Helper to construct explorer url
export function getAptosExplorerUrl(hash: string, type: "txn" | "account", networkNameOrUrl?: string): string {
  if (!hash) return "#";
  const norm = (networkNameOrUrl || "").toLowerCase();
  
  if (norm.includes("testnet") || norm === "testnet") {
    return `https://explorer.aptoslabs.com/${type}/${hash}?network=testnet`;
  } else if (norm.includes("devnet") || norm === "devnet") {
    return `https://explorer.aptoslabs.com/${type}/${hash}?network=devnet`;
  } else if (norm.includes("mainnet") || norm === "mainnet") {
    return `https://explorer.aptoslabs.com/${type}/${hash}?network=mainnet`;
  } else {
    return `https://explorer.aptoslabs.com/${type}/${hash}?network=custom&node=https%3A%2F%2Fapi.shelbynet.shelby.xyz%2Fv1`;
  }
}

// Helper function to check if network url or name represents Shelby Devnet
export function isValidShelbyDevnet(url?: string, name?: string): boolean {
  if (!url && !name) return false;
  const normalizedUrl = (url || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();
  return (
    normalizedUrl.includes("shelbynet.shelby.xyz") ||
    normalizedUrl.includes("shelbynet") ||
    normalizedUrl.includes("shelby") ||
    normalizedName.includes("shelby")
  );
}
