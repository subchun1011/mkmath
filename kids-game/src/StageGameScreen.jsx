import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MainGameLayout from './MainGameLayout.jsx';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import { useCoins } from './coins/CoinContext'; 
import CockpitHUD from './components/battle/CockpitHUD.jsx';
import InputArea from './logic/InputArea'; 
import { getQuestion } from './logic/QuestionFactory'; 
import './StageGameScreen.css';

const TOTAL_QUESTIONS = 10;

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestionCount, setCompletedQuestionCount] = useState(0);
  const [score, setScore] = useState(0);
  const [battleSessionId, setBattleSessionId] = useState(0);
  const timerRef = useRef(null);

  const nextQuestion = useCallback(() => {
    const newQ = getQuestion(category, level, subCategory);
    setCurrentQuestion(newQ);
    setUserInput(''); 
  }, [category, level, subCategory]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setCompletedQuestionCount(0);
    setScore(0);
    setBattleSessionId((prev) => prev + 1);
    nextQuestion();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nextQuestion]);

  const titleText = useMemo(() => {
    const label = category === 'math' ? (subCategory || 'math') : (category || 'game');
    return `${label.toUpperCase()} - LV.${level}`;
  }, [category, subCategory, level]);

  const isStageCleared = completedQuestionCount >= TOTAL_QUESTIONS;
  const showResultOverlay = isGameOver || isStageCleared;
  const isVictoryResult = isWin || isStageCleared;

  const triggerEnergyCoreBurst = useCallback(() => {
    // CockpitHUD가 코어 이펙트 사운드/진동과 연결될 수 있도록 남겨둔 확장 포인트입니다.
  }, []);

  const handleInput = useCallback((num) => {
    if (showResultOverlay) return;
    setUserInput(prev => {
      const next = num + prev;
      return next.length > 4 ? prev : next; 
    });
  }, [showResultOverlay]);

  const handleBackspace = useCallback(() => {
    if (showResultOverlay) return;
    setUserInput(prev => prev.slice(1));
  }, [showResultOverlay]);

  const handleCorrect = useCallback(() => {
    if (showResultOverlay) return;
    const result = processCorrect();
    if (!result.didFire) return;

    const nextCompletedQuestionCount = completedQuestionCount + 1;

    setCompletedQuestionCount(nextCompletedQuestionCount);
    setScore((prev) => prev + 10);
    earnCoins(10); 
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (nextCompletedQuestionCount >= TOTAL_QUESTIONS) {
      setCurrentQuestionIndex(TOTAL_QUESTIONS - 1);
      setUserInput('');
      return;
    }

    if (result.nextEnemyHP > 0) {
      timerRef.current = setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        nextQuestion();
      }, 600);
    }
  }, [showResultOverlay, processCorrect, completedQuestionCount, earnCoins, nextQuestion]);

  const handleWrong = useCallback(() => {
    if (showResultOverlay) return;
    processWrong();
    loseCoins(10); 
    setUserInput(''); 
  }, [showResultOverlay, processWrong, loseCoins]);

  const handleRetry = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetBattle();
    setCurrentQuestionIndex(0);
    setCompletedQuestionCount(0);
    setScore(0);
    setUserInput('');
    setBattleSessionId((prev) => prev + 1);
    nextQuestion();
  }, [resetBattle, nextQuestion]);

  const handleContinue = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetBattle();
    setCurrentQuestionIndex(0);
    setCompletedQuestionCount(0);
    setScore(0);
    setUserInput('');
    setCurrentQuestion(null);
    setBattleSessionId((prev) => prev + 1);
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

  const safeCurrentQuestion = currentQuestion || {
    question: '...',
    answer: '',
    hint: '문제를 준비하는 중이에요.',
    category,
    operator: '+',
  };

  const [num1, num2] = getNumbersFromQuestion(safeCurrentQuestion);
  const operator = safeCurrentQuestion.operator || '+';

  const gameLogic = useMemo(() => ({
    // CockpitHUD에 전달해야 하는 핵심 상태/함수:
    // playerHP, enemyHP, maxHP, currentQuestion, num1, num2, operator,
    // energyCoreLevel, actionState, combo, weaponRow, missileCol, triggerEnergyCoreBurst
    playerHP,
    enemyHP,
    maxHP,
    currentQuestion: safeCurrentQuestion,
    num1,
    num2,
    operator,
    userInput,
    category,
    hint: safeCurrentQuestion.hint,
    energyCoreLevel: Math.min(5, missileCol + 1),
    missileCol,
    combo,
    actionState,
    weaponRow,
    triggerEnergyCoreBurst,
    battleSessionId,
    currentQuestionIndex,
    completedQuestionCount,
    score,
  }), [
    actionState,
    battleSessionId,
    combo,
    completedQuestionCount,
    currentQuestionIndex,
    enemyHP,
    maxHP,
    missileCol,
    num1,
    num2,
    operator,
    playerHP,
    score,
    userInput,
    category,
    safeCurrentQuestion.hint,
    safeCurrentQuestion,
    triggerEnergyCoreBurst,
    weaponRow,
  ]);

  return (
    <div className="stage-game-screen" style={{ height: '100dvh', minHeight: '100dvh', position: 'relative', backgroundColor: '#0a0a2a' }}>
      <MainGameLayout
        num1={num1}
        num2={num2}
        operator={operator}
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
            <CockpitHUD gameLogic={gameLogic} />
            {!currentQuestion && (
              <div className="stage-game-screen__loading stage-game-screen__loading--overlay">Loading Game...</div>
            )}
          </div>
        )}

        questionContent={null}

        inputContent={(
          <div className="stage-game-screen__input">
            <InputArea
              userInput={userInput}
              correctAnswer={safeCurrentQuestion.answer}
              onKeyPress={handleInput}
              onBackspace={handleBackspace}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
            />
          </div>
        )}
      />

      {showResultOverlay && (
        <div className="stage-game-screen__overlay">
          <div className="stage-game-screen__modal">
            <h2 className={`stage-game-screen__modal-title ${isVictoryResult ? 'stage-game-screen__modal-title--win' : 'stage-game-screen__modal-title--lose'}`}>
              {isVictoryResult ? "YOU WIN! 🏆" : "Try Again... 💀"}
            </h2>
            <p className="stage-game-screen__modal-text">
              {isVictoryResult ? "Great job! You cleared all 10 questions." : "Don't give up! Practice makes perfect."}
            </p>
            <div className="stage-game-screen__modal-actions">
              {isVictoryResult ? (
                <button type="button" className="stage-game-screen__primary-button" onClick={handleContinue}>CONTINUE</button>
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
