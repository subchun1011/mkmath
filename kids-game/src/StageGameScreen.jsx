import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MainGameLayout from './MainGameLayout.jsx';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import { useCoins } from './coins/CoinContext'; // ⭐ 전역 코인 컨텍스트 임포트
import SpaceshipBattle from './actionarea/spaceshipbattle/SpaceshipBattle'; 
import InputArea from './logic/InputArea'; 
import { getQuestion } from './logic/QuestionFactory'; 
import './StageGameScreen.css';

/**
 * 어떤 데이터 구조에서도 숫자를 정확히 뽑아내는 헬퍼 함수
 */
const getNumbersFromQuestion = (q) => {
  if (!q) return [0, 0];
  if (q.num1 !== undefined && q.num2 !== undefined) {
    return [Number(q.num1), Number(q.num2)];
  }
  const sourceText = q.text || q.question || q.q || "";
  const matches = sourceText.match(/\d+/g);
  if (matches && matches.length >= 2) {
    return [Number(matches[0]), Number(matches[1])];
  }
  return [0, 0];
};

const StageGameScreen = ({ category, subCategory, level, onBack }) => {
  // ⭐ 전역 코인 상태 및 기능
  const { coins, earnCoins, loseCoins } = useCoins();

  // 배틀 로직 커스텀 훅 (coins는 전역을 사용하므로 여기서 제외 가능)
  const { 
    playerHP, 
    enemyHP, 
    actionState, 
    isWin, 
    isGameOver, 
    processCorrect, 
    processWrong,
    resetBattle 
  } = useSpaceBattleLogic();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userInput, setUserInput] = useState(''); 
  const timerRef = useRef(null);

  const nextQuestion = useCallback(() => {
    const newQ = getQuestion(category, level, subCategory);
    setCurrentQuestion(newQ);
    setUserInput(''); 
  }, [category, level, subCategory]);

  useEffect(() => {
    nextQuestion(); 
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nextQuestion]);

  const titleText = useMemo(() => {
    const label = category === 'math' ? (subCategory || 'math') : (category || 'game');
    return `${label.toUpperCase()} - LV.${level}`;
  }, [category, subCategory, level]);

  const handleInput = useCallback((num) => {
    if (isGameOver) return;
    setUserInput(prev => {
      const next = num + prev; 
      return next.length > 4 ? prev : next; 
    });
  }, [isGameOver]);

  const handleBackspace = useCallback(() => {
    if (isGameOver) return;
    setUserInput(prev => prev.slice(1)); 
  }, [isGameOver]);

  // ⭐ 정답 시: 공격 로직 실행 + 10코인 획득
  const handleCorrect = useCallback(() => {
    if (isGameOver) return;
    processCorrect(); 
    earnCoins(10); 
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (enemyHP > 0) nextQuestion(); 
    }, 600);
  }, [isGameOver, processCorrect, earnCoins, enemyHP, nextQuestion]);

  // ⭐ 오답 시: 피격 로직 실행 + 10코인 차감
  const handleWrong = useCallback(() => {
    if (isGameOver) return;
    processWrong();
    loseCoins(10); 
    setUserInput(''); 
  }, [isGameOver, processWrong, loseCoins]);

  const handleRetry = useCallback(() => {
    resetBattle();
    nextQuestion();
  }, [resetBattle, nextQuestion]);

  if (!currentQuestion) {
    return <div className="stage-game-screen__loading">Loading...</div>;
  }

  const [num1, num2] = getNumbersFromQuestion(currentQuestion);

  return (
    <div className="stage-game-screen">
      <MainGameLayout
        num1={num1}
        num2={num2}
        operator={currentQuestion.operator || '+'}
        userInput={userInput}
        
        // ⭐ 상단 HUD 영역: 시인성 개선 및 SHOP 제거
        timerContent={(
          <div className="stage-game-screen__hud">
            <div className="stage-game-screen__hud-left">
              <button type="button" className="stage-game-screen__back-button" onClick={onBack}>⬅</button>
              <div className="stage-game-screen__coin-display">
                <span className="coin-icon">💰</span>
                <span className="coin-amount">{coins}</span>
              </div>
            </div>
            <div className="stage-game-screen__title">{titleText}</div>
            <div className="stage-game-screen__hud-right" /> {/* 레이아웃 균형용 */}
          </div>
        )}

        actionContent={(
          <div className="stage-game-screen__battle">
            <SpaceshipBattle
              playerHP={playerHP}
              enemyHP={enemyHP}
              actionState={actionState}
              missileTier={1} 
            />
          </div>
        )}

        inputContent={(
          <div className="stage-game-screen__input">
            <InputArea
              userInput={userInput}
              correctAnswer={currentQuestion.answer}
              onKeyPress={handleInput}
              onBackspace={handleBackspace}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
            />
          </div>
        )}
      />

      {isGameOver && (
        <div className="stage-game-screen__overlay">
          <div className="stage-game-screen__modal">
            <h2 className={`stage-game-screen__modal-title ${isWin ? 'stage-game-screen__modal-title--win' : 'stage-game-screen__modal-title--lose'}`}>
              {isWin ? "YOU WIN! 🏆" : "Try Again... 💀"}
            </h2>
            <p className="stage-game-screen__modal-text">
              {isWin ? "Great job! You defeated the enemy." : "Don't give up! Practice makes perfect."}
            </p>
            <div className="stage-game-screen__modal-actions">
              {isWin ? (
                <button type="button" className="stage-game-screen__primary-button" onClick={onBack}>CONTINUE</button>
              ) : (
                <>
                  <button type="button" className="stage-game-screen__primary-button" onClick={handleRetry}>RETRY</button>
                  <button type="button" className="stage-game-screen__secondary-button" onClick={onBack}>QUIT</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageGameScreen;