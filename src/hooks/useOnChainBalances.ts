import { useState, useEffect, useCallback, useRef } from "react";
import { Buffer } from "buffer";
import { aptosClient, COIN_TYPES } from "../utils/networkConfig";

// Ensure Buffer global is polyfilled inside the hook too
if (typeof window !== "undefined") {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}

export interface BalanceState {
  aptBalance: number;
  shelbyUsdBalance: number;
  isLoading: boolean;
  error: Error | null;
}

export function useOnChainBalances(address: string | null) {
  const [balances, setBalances] = useState<BalanceState>({
    aptBalance: 0,
    shelbyUsdBalance: 0,
    isLoading: false,
    error: null,
  });

  const loadingRef = useRef(false);

  const refreshBalances = useCallback(async () => {
    if (!address || !address.startsWith("0x")) {
      setBalances({
        aptBalance: 0,
        shelbyUsdBalance: 0,
        isLoading: false,
        error: null,
      });
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    setBalances((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Fetch APT balance using getAccountCoinAmount
      let rawApt = 0;
      try {
        rawApt = await aptosClient.getAccountCoinAmount({
          accountAddress: address,
          coinType: COIN_TYPES.APT,
        });
      } catch (aptErr) {
        try {
          rawApt = await aptosClient.getAccountCoinAmount({
            accountAddress: address,
            coinType: COIN_TYPES.APT_ALTERNATIVE,
          });
        } catch (altErr) {
          console.warn("APT coin lookup failed on both standard and alterative types", altErr);
        }
      }
      const aptValue = rawApt / 100_000_000; // 8 Decimals for APT standard

      // 2. Fetch ShelbyUSD balance using getAccountCoinAmount
      let rawShelby = 0;
      try {
        rawShelby = await aptosClient.getAccountCoinAmount({
          accountAddress: address,
          coinType: COIN_TYPES.ShelbyUSD,
        });
      } catch (shelbyErr) {
        console.warn("ShelbyUSD lookup failed, account probably NOT registered yet:", shelbyErr);
      }
      const shelbyValue = rawShelby / 1_000_000; // 6 Decimals for ShelbyUSD standard

      setBalances({
        aptBalance: aptValue,
        shelbyUsdBalance: shelbyValue,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Failed to fetch on-chain balances:", err);
      setBalances((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [address]);

  // Hook auto-triggers on connect/address update and periodically polls every 15s
  useEffect(() => {
    refreshBalances();

    const interval = setInterval(() => {
      refreshBalances();
    }, 15000);

    return () => clearInterval(interval);
  }, [address, refreshBalances]);

  return {
    ...balances,
    refreshBalances,
  };
}
