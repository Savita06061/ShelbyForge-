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
