import React, { createContext, useContext, useMemo, useState } from 'react';

const CoinContext = createContext(null);

export function CoinProvider({ children }) {
  const [coins, setCoins] = useState(0);

  const value = useMemo(() => ({
    coins,
    // 정답 시 코인 획득
    earnCoins(amount) {
      setCoins((prev) => prev + Math.max(0, amount));
    },
    // 오답 시 코인 차감 (패널티 - 0 이하로 안 내려감)
    loseCoins(amount) {
      setCoins((prev) => Math.max(0, prev - amount));
    },
    // 아이템 구매 시 사용 (잔액 부족 시 실패 반환)
    spendCoins(amount) {
      const safeAmount = Math.max(0, amount);
      let didSpend = false;
      setCoins((prev) => {
        if (prev < safeAmount) return prev;
        didSpend = true;
        return prev - safeAmount;
      });
      return didSpend;
    },
  }), [coins]);

  return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
}

export function useCoins() {
  const context = useContext(CoinContext);
  if (!context) throw new Error('useCoins must be used within a CoinProvider');
  return context;
}