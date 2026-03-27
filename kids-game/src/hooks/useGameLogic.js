// src/hooks/useGameLogic.js
import { useState } from 'react';

export const useGameLogic = () => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [coins, setCoins] = useState(0);
  const [actionState, setActionState] = useState('idle'); // 'playerFire', 'enemyFire', 'idle'

  // 정답 시 로직
  const processCorrect = () => {
    setActionState('playerFire');
    setEnemyHP((prev) => Math.max(0, prev - 10));
    setCoins((prev) => prev + 10);
    // 600에서 1000으로 변경 (미사일이 화면 끝까지 갈 시간을 줌)
    setTimeout(() => setActionState('idle'), 1000);
  };

  // 오답 시 로직
  const processWrong = () => {
    setActionState('enemyFire');
    setPlayerHP((prev) => Math.max(0, prev - 10));
    // 오답 시에도 1000으로 변경
    setTimeout(() => setActionState('idle'), 1000);
  };

  return {
    playerHP, enemyHP, coins, actionState,
    processCorrect, processWrong
  };
};