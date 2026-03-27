// src/hooks/useSpaceBattleLogic.js
import { useState, useEffect, useCallback } from 'react';

export const useSpaceBattleLogic = () => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [coins, setCoins] = useState(0);
  const [actionState, setActionState] = useState('idle'); // 'playerFire', 'enemyFire', 'idle'
  
  // 10문제 맞추면 100% 깎이는 랜덤 데미지 저장소
  const [damageSequence, setDamageSequence] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);

  // [추가] 파생 상태: 게임 종료 여부 판정
  const isWin = enemyHP <= 0;
  const isLose = playerHP <= 0;
  const isGameOver = isWin || isLose;

  // 데미지 시퀀스 생성 (합계 100)
  const generateDamageSequence = useCallback(() => {
    let sequence = [];
    let remaining = 100;
    for (let i = 0; i < 9; i++) {
      const min = 5;
      const max = Math.min(15, remaining - (9 - i) * min); 
      const damage = Math.floor(Math.random() * (max - min + 1)) + min;
      sequence.push(damage);
      remaining -= damage;
    }
    sequence.push(remaining);
    return sequence.sort(() => Math.random() - 0.5);
  }, []);

  // 초기화 및 리셋 (게임 재시작 시 호출)
  const resetBattle = useCallback(() => {
    setPlayerHP(100);
    setEnemyHP(100);
    setCorrectCount(0);
    setDamageSequence(generateDamageSequence());
    setActionState('idle');
  }, [generateDamageSequence]);

  useEffect(() => {
    setDamageSequence(generateDamageSequence());
  }, [generateDamageSequence]);

  // [정답] 우주선 공격 로직
  const processCorrect = () => {
    // 게임이 이미 끝났다면 아무것도 하지 않음
    if (isGameOver || correctCount >= 10) return;

    const damage = damageSequence[correctCount];
    setActionState('playerFire');
    
    setEnemyHP((prev) => {
      const nextHP = Math.max(0, prev - damage);
      return nextHP;
    });
    
    setCoins((prev) => prev + 10);
    setCorrectCount((prev) => prev + 1);

    setTimeout(() => setActionState('idle'), 1000);
  };

  // [오답] 적의 반격 로직
  const processWrong = () => {
    // 게임이 이미 끝났다면 아무것도 하지 않음
    if (isGameOver) return;

    setActionState('enemyFire');
    setPlayerHP((prev) => Math.max(0, prev - 10)); // 플레이어 데미지는 고정 10%
    
    setTimeout(() => setActionState('idle'), 1000);
  };

  return {
    playerHP, 
    enemyHP, 
    coins, 
    actionState,
    correctCount,
    isWin,        // 승리 여부 전달
    isLose,       // 패배 여부 전달
    isGameOver,   // 게임 종료 여부 전달
    processCorrect, 
    processWrong, 
    resetBattle
  };
};