import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpaceBattleLogic = () => {
  const MAX_HP = 100;
  const getRandomWeaponRow = () => (Math.random() < 0.5 ? 2 : 3);
  const clampHp = (value) => {
    const safeValue = Number.isFinite(value) ? value : MAX_HP;
    return Math.max(0, Math.min(MAX_HP, safeValue));
  };

  const [playerHP, setPlayerHP] = useState(MAX_HP);
  const [enemyHP, setEnemyHP] = useState(MAX_HP);
  const [actionState, setActionState] = useState('idle'); 
  
  const [combo, setCombo] = useState(0);
  const [weaponRow, setWeaponRow] = useState(getRandomWeaponRow); 
  const [damageSequence, setDamageSequence] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const actionTimeoutRef = useRef(null);

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
    window.clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = null;
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
    return () => {
      window.clearTimeout(actionTimeoutRef.current);
    };
  }, [resetBattle]);

  // 콤보 0~2: 1열, 3~4: 2열, 5~6: 3열, 7~8: 4열, 9+: 5열
  const missileCol = Math.min(4, 
    combo >= 9 ? 4 : combo >= 7 ? 3 : combo >= 5 ? 2 : combo >= 3 ? 1 : 0
  );

  const processCorrect = useCallback(() => {
    if (isGameOver) {
      return { didFire: false, nextEnemyHP: enemyHP };
    }

    const damage = damageSequence[correctCount] || 10;
    const nextEnemyHP = clampHp(enemyHP - damage);

    window.clearTimeout(actionTimeoutRef.current);
    setActionState('playerFire');
    setEnemyHP(nextEnemyHP);
    setCorrectCount((prev) => prev + 1);
    setCombo((prev) => prev + 1);

    actionTimeoutRef.current = window.setTimeout(() => setActionState('idle'), 1000);

    return { didFire: true, nextEnemyHP };
  }, [correctCount, damageSequence, enemyHP, isGameOver]);

  const processWrong = useCallback(() => {
    if (isGameOver) {
      return { didFire: false, nextPlayerHP: playerHP };
    }

    const nextPlayerHP = clampHp(playerHP - 10);

    window.clearTimeout(actionTimeoutRef.current);
    setActionState('enemyFire');
    setPlayerHP(nextPlayerHP);
    // 오답 시 콤보만 초기화하고, 시작에 고른 무기 계열(2열/3열)은 유지한다.
    setCombo(0);

    actionTimeoutRef.current = window.setTimeout(() => setActionState('idle'), 1000);

    return { didFire: true, nextPlayerHP };
  }, [isGameOver, playerHP]);

  return {
    playerHP,
    enemyHP,
    maxHP: MAX_HP,
    actionState,
    isWin,
    isGameOver,
    combo,
    weaponRow,
    missileCol,
    correctCount,
    processCorrect,
    processWrong,
    resetBattle,
  };
};
