import React, { useState, useEffect, useRef } from 'react';
import MainGameLayout from './MainGameLayout.jsx';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import SpaceshipBattle from './actionarea/spaceshipbattle/SpaceshipBattle'; 
import QuestionArea from './logic/QuestionArea'; 
import InputArea from './logic/InputArea'; 
import { getQuestion } from './logic/QuestionFactory'; 
import './StageGameScreen.css';

const StageGameScreen = ({ category, subCategory, level, onBack }) => {
  // 1. 전용 훅에서 승리/패배 상태 및 리셋 함수 추가 추출
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
  const [missileTier, setMissileTier] = useState(1); 
  const timerRef = useRef(null);
  const titleText = category === 'math'
    ? `${(subCategory || 'math').toUpperCase()} - LV.${level}`
    : `${(category || 'game').toUpperCase()} - LV.${level}`;

  const nextQuestion = () => {
    const newQ = getQuestion(category, level, subCategory);
    setCurrentQuestion(newQ);
  };

  useEffect(() => {
    nextQuestion(); 
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [category, level, subCategory]);

  const handleCorrect = () => {
    if (isGameOver) return; // 게임 종료 시 동작 방지

    processCorrect(); 
    
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // 적 에너지가 남아있을 때만 다음 문제 로드
      if (enemyHP > 0) {
        nextQuestion(); 
      }
    }, 600);
  };

  const handleWrong = () => {
    if (isGameOver) return; // 게임 종료 시 동작 방지
    processWrong(); 
  };

  // 재시작 로직
  const handleRetry = () => {
    resetBattle();
    nextQuestion();
  };

  if (!currentQuestion) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div className="stage-game-screen">
      <MainGameLayout
        timerContent={(
          <div className="stage-game-screen__hud">
            <div className="stage-game-screen__hud-left">
              <button
                type="button"
                className="stage-game-screen__icon-button"
                onClick={onBack}
              >
                ⬅
              </button>
              <div className="stage-game-screen__coin">💰 {coins}</div>
            </div>
            <div className="stage-game-screen__title">{titleText}</div>
            <button type="button" className="stage-game-screen__shop-button">
              🛒 SHOP
            </button>
          </div>
        )}
        actionContent={(
          <div className="stage-game-screen__battle">
            <SpaceshipBattle
              playerHP={playerHP}
              enemyHP={enemyHP}
              actionState={actionState}
              missileTier={missileTier}
            />
          </div>
        )}
        questionContent={(
          <div className="stage-game-screen__question">
            <div className="stage-game-screen__question-header">
              문제를 읽고 정답을 입력해보세요
            </div>
            <div className="stage-game-screen__question-body">
              <QuestionArea questionData={currentQuestion} />
            </div>
          </div>
        )}
        inputContent={(
          <div className="stage-game-screen__input">
            <InputArea
              correctAnswer={currentQuestion.answer}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
            />
          </div>
        )}
      />

      {isGameOver && (
        <div className="stage-game-screen__overlay">
          <div className="stage-game-screen__modal">
            <h2
              className={`stage-game-screen__modal-title ${
                isWin
                  ? 'stage-game-screen__modal-title--win'
                  : 'stage-game-screen__modal-title--lose'
              }`}
            >
              {isWin ? "YOU WIN! 🏆" : "Try Again... 💀"}
            </h2>
            
            <p className="stage-game-screen__modal-text">
              {isWin ? "Great job! You defeated the enemy." : "Don't give up! Practice makes perfect."}
            </p>

            <div className="stage-game-screen__modal-actions">
              {isWin ? (
                <button
                  type="button"
                  className="stage-game-screen__primary-button"
                  onClick={onBack}
                >
                  CONTINUE
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="stage-game-screen__primary-button"
                    onClick={handleRetry}
                  >
                    RETRY
                  </button>
                  <button
                    type="button"
                    className="stage-game-screen__secondary-button"
                    onClick={onBack}
                  >
                    QUIT
                  </button>
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
