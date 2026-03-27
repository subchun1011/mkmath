import React, { createContext, useContext, useMemo, useState } from 'react';

const CoinContext = createContext(null);

export function CoinProvider({ children }) {
  const [coins, setCoins] = useState(0);

  const value = useMemo(() => ({
    coins,
    earnCoins(amount) {
      setCoins((prevCoins) => prevCoins + Math.max(0, amount));
    },
    spendCoins(amount) {
      const safeAmount = Math.max(0, amount);
      let didSpend = false;

      setCoins((prevCoins) => {
        if (prevCoins < safeAmount) {
          return prevCoins;
        }

        didSpend = true;
        return prevCoins - safeAmount;
      });

      return didSpend;
    },
  }), [coins]);

  return (
    <CoinContext.Provider value={value}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinContext);

  if (!context) {
    throw new Error('useCoins must be used within a CoinProvider');
  }

  return context;
}
