import { useState, useEffect, useCallback } from 'react';

export const useSpaceBattleLogic = () => {
  const MAX_HP = 100;
  const getRandomWeaponRow = () => (Math.random() < 0.5 ? 2 : 3);
  const clampHp = (value) => {
    const safeValue = Number.isFinite(value) ? value : MAX_HP;
    return Math.max(0, Math.min(MAX_HP, safeValue));
  };

  const [playerHP, setPlayerHP] = useState(MAX_HP);
  const [enemyHP, setEnemyHP] = useState(MAX_HP);
  const [coins, setCoins] = useState(0);
  const [actionState, setActionState] = useState('idle'); 
  
  const [combo, setCombo] = useState(0);
  const [weaponRow, setWeaponRow] = useState(getRandomWeaponRow); 
  const [damageSequence, setDamageSequence] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);

  const isGameOver = enemyHP <= 0 || playerHP <= 0;
  const isWin = enemyHP <= 0;

  const generateDamageSequence = useCallback(() => {
    let sequence = [];
    let remaining = MAX_HP;
    for (let i = 0; i < 9; i++) {
      const damage = Math.floor(Math.random() * 10) + 5;
      sequence.push(damage);
      remaining -= damage;
    }
    sequence.push(Math.max(0, remaining));
    return sequence.sort(() => Math.random() - 0.5);
  }, []);

  const resetBattle = useCallback(() => {
    setPlayerHP(MAX_HP);
    setEnemyHP(MAX_HP);
    setCorrectCount(0);
    setCombo(0);
    // 시작 무기는 2열 또는 3열의 첫 번째 컬럼 계열 중 하나를 랜덤 고정한다.
    setWeaponRow(getRandomWeaponRow());
    setDamageSequence(generateDamageSequence());
    setActionState('idle');
  }, [generateDamageSequence]);

  useEffect(() => {
    resetBattle();
  }, [resetBattle]);

  // 콤보 0~2: 1열, 3~4: 2열, 5~6: 3열, 7~8: 4열, 9+: 5열
  const missileCol = Math.min(4, 
    combo >= 9 ? 4 : combo >= 7 ? 3 : combo >= 5 ? 2 : combo >= 3 ? 1 : 0
  );

  const processCorrect = () => {
    if (isGameOver) return;
    const damage = damageSequence[correctCount] || 10;
    setActionState('playerFire');
    setEnemyHP((prev) => clampHp(prev - damage));
    setCorrectCount(prev => prev + 1);
    setCombo(prev => prev + 1); // ⭐ 콤보 증가

    setTimeout(() => setActionState('idle'), 1000);
  };

  const processWrong = () => {
    if (isGameOver) return;
    setActionState('enemyFire');
    setPlayerHP((prev) => clampHp(prev - 10));
    // 오답 시 콤보만 초기화하고, 시작에 고른 무기 계열(2열/3열)은 유지한다.
    setCombo(0);

    setTimeout(() => setActionState('idle'), 1000);
  };

  return {
    playerHP,
    enemyHP,
    maxHP: MAX_HP,
    actionState,
    combo,
    weaponRow,
    missileCol,
    isWin, isGameOver, processCorrect, processWrong, resetBattle
  };
};
