import React, { useState, useEffect, useRef } from 'react';
import MainGameLayout from './MainGameLayout.jsx';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import SpaceshipBattle from './actionarea/spaceshipbattle/SpaceshipBattle'; 
import InputArea from './logic/InputArea'; 
import { getQuestion } from './logic/QuestionFactory'; 
import './StageGameScreen.css';

const StageGameScreen = ({ category, subCategory, level, onBack }) => {
  const { 
    playerHP, 
    enemyHP, 
    actionState, 
    coins, 
    isWin, 
    isLose, 
    isGameOver, 
    processCorrect, 
    processWrong,
    resetBattle 
  } = useSpaceBattleLogic();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userInput, setUserInput] = useState(''); 
  const timerRef = useRef(null);

  const titleText = category === 'math'
    ? `${(subCategory || 'math').toUpperCase()} - LV.${level}`
    : `${(category || 'game').toUpperCase()} - LV.${level}`;

  // ⭐ 어떤 속성명으로 데이터가 오든 숫자를 추출하는 무적 파서
  const getNumbersFromQuestion = (q) => {
    if (!q) return [0, 0];
    
    // 1. 이미 num1, num2가 객체 안에 숫자로 존재할 경우
    if (q.num1 !== undefined && q.num2 !== undefined) {
      return [Number(q.num1), Number(q.num2)];
    }

    // 2. text, question, q 등 문자열 속성에서 숫자를 추출
    const sourceText = q.text || q.question || q.q || "";
    const matches = sourceText.match(/\d+/g);
    
    if (matches && matches.length >= 2) {
      return [Number(matches[0]), Number(matches[1])];
    }

    // 3. 최후의 수단 (데이터 확인용 로그)
    console.warn("데이터 구조 확인 필요:", q);
    return [0, 0];
  };

  const nextQuestion = () => {
    const newQ = getQuestion(category, level, subCategory);
    setCurrentQuestion(newQ);
    setUserInput(''); 
  };

  useEffect(() => {
    nextQuestion(); 
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [category, level, subCategory]);

  const handleInput = (num) => {
    if (isGameOver) return;
    setUserInput(prev => {
      const next = num + prev; 
      if (next.length > 4) return prev; 
      return next;
    });
  };

  const handleBackspace = () => {
    setUserInput(prev => prev.slice(1)); 
  };

  const handleCorrect = () => {
    if (isGameOver) return;
    processCorrect(); 
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (enemyHP > 0) nextQuestion(); 
    }, 600);
  };

  const handleWrong = () => {
    if (isGameOver) return;
    processWrong();
    setUserInput(''); 
  };

  const handleRetry = () => {
    resetBattle();
    nextQuestion();
  };

  if (!currentQuestion) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  // ⭐ 렌더링 직전에 문제에서 숫자를 확실히 뽑아냅니다.
  const [num1, num2] = getNumbersFromQuestion(currentQuestion);

  return (
    <div className="stage-game-screen">
      <MainGameLayout
        // ⭐ 가공된 순수 숫자를 넘깁니다.
        num1={num1}
        num2={num2}
        operator={currentQuestion.operator || '+'}
        userInput={userInput}
        
        timerContent={(
          <div className="stage-game-screen__hud">
            <div className="stage-game-screen__hud-left">
              <button type="button" className="stage-game-screen__icon-button" onClick={onBack}>⬅</button>
              <div className="stage-game-screen__coin">💰 {coins}</div>
            </div>
            <div className="stage-game-screen__title">{titleText}</div>
            <button type="button" className="stage-game-screen__shop-button">🛒 SHOP</button>
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

        questionContent={null} 

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