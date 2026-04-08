import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MainGameLayout from './MainGameLayout.jsx';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import { useCoins } from './coins/CoinContext'; 
import CockpitHUD from './components/battle/CockpitHUD.jsx';
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

  const triggerEnergyCoreBurst = useCallback(() => {
    // CockpitHUD가 코어 이펙트 사운드/진동과 연결될 수 있도록 남겨둔 확장 포인트입니다.
  }, []);

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
  }), [
    actionState,
    combo,
    enemyHP,
    maxHP,
    missileCol,
    num1,
    num2,
    operator,
    playerHP,
    userInput,
    category,
    safeCurrentQuestion.hint,
    safeCurrentQuestion,
    triggerEnergyCoreBurst,
    weaponRow,
  ]);

  const isGameReady = Boolean(gameLogic);

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

        questionContent={(
          <div className="stage-game-screen__question">
            <div className="stage-game-screen__question-panel">
              <div className="stage-game-screen__question-panel-title">COCKPIT LINK</div>
              <div className="stage-game-screen__question-panel-text">
                문제는 조종석 홀로그램 화면에 표시됩니다.
              </div>
              <div className="stage-game-screen__question-panel-subtext">
                아래 입력 패드로 답을 입력해 에너지 코어를 충전해보세요.
              </div>
            </div>
          </div>
        )}

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
