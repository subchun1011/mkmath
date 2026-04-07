import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MainGameLayout from './MainGameLayout.jsx';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import { useCoins } from './coins/CoinContext'; 
import SpaceshipBattle from './actionarea/spaceshipbattle/SpaceshipBattle'; 
import InputArea from './logic/InputArea'; 
import { getQuestion } from './logic/QuestionFactory'; 
import './StageGameScreen.css';

const StageGameScreen = ({ category, subCategory, level, onBack }) => {
  const { coins, earnCoins, loseCoins } = useCoins();

  // ⭐ 로직 훅에서 combo, weaponRow, missileCol을 꼭 구조분해로 가져와야 합니다!
  const { 
    playerHP, 
    enemyHP, 
    maxHP,
    actionState, 
    isWin, 
    isGameOver, 
    combo,          // 추가
    weaponRow,      // 추가
    missileCol,     // 추가
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

  const handleCorrect = useCallback(() => {
    if (isGameOver) return;
    processCorrect(); 
    earnCoins(10); 
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (enemyHP > 0) nextQuestion(); 
    }, 600);
  }, [isGameOver, processCorrect, earnCoins, enemyHP, nextQuestion]);

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

  const getNumbersFromQuestion = (q) => {
    if (!q) return [0, 0];
    if (q.num1 !== undefined && q.num2 !== undefined) return [Number(q.num1), Number(q.num2)];
    const sourceText = q.text || q.question || q.q || "";
    const matches = sourceText.match(/\d+/g);
    if (matches && matches.length >= 2) return [Number(matches[0]), Number(matches[1])];
    return [0, 0];
  };

  if (!currentQuestion) return <div className="stage-game-screen__loading">Loading...</div>;

  const [num1, num2] = getNumbersFromQuestion(currentQuestion);

  return (
    <div className="stage-game-screen">
      <MainGameLayout
        num1={num1}
        num2={num2}
        operator={currentQuestion.operator || '+'}
        userInput={userInput}
        
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
            <div className="stage-game-screen__hud-right" />
          </div>
        )}

        actionContent={(
          <div className="stage-game-screen__battle">
            {/* ⭐ 핵심: SpaceshipBattle로 모든 데이터를 전달합니다. */}
            <SpaceshipBattle
              playerHP={playerHP}
              enemyHP={enemyHP}
              maxHP={maxHP}
              actionState={actionState}
              combo={combo}
              weaponRow={weaponRow}
              missileCol={missileCol}
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
