import React, { useMemo } from 'react';
import { addCoins, spendCoins, subtractCoins, useCoinStore } from '../store/useCoinStore.js';

export function CoinProvider({ children }) {
  return <>{children}</>;
}

export function useCoins() {
  const coins = useCoinStore((state) => state.coins);

  return useMemo(() => ({
    coins,
    earnCoins(amount) {
      addCoins(amount);
    },
    loseCoins(amount) {
      subtractCoins(amount);
    },
    spendCoins(amount) {
      return spendCoins(amount);
    },
  }), [coins]);
}
