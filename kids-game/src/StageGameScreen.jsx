import React, { useState, useEffect, useRef } from 'react';
import { useSpaceBattleLogic } from './hooks/useSpaceBattleLogic'; 
import SpaceshipBattle from './actionarea/spaceshipbattle/SpaceshipBattle'; 
import QuestionArea from './logic/QuestionArea'; 
import InputArea from './logic/InputArea'; 
import { getQuestion } from './logic/QuestionFactory'; 

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
    <div style={layoutStyle}>
    
      {/* 1. HUD 영역 */}
      <div style={hudStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={backButtonStyle}>⬅</button>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>💰 {coins}</div>
        </div>
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
          {subCategory.toUpperCase()} - LV.{level}
        </div>
        <button className="shop-btn" style={shopButtonStyle}>🛒 SHOP</button>
      </div>

      {/* 2. 배틀 영역 */}
      <div style={{ height: '30%', position: 'relative' }}>
        <SpaceshipBattle 
          playerHP={playerHP}
          enemyHP={enemyHP}
          actionState={actionState}
          missileTier={missileTier}
        />
      </div>

      {/* 3. 문제 영역 */}
      <div style={{ height: '30%' }}>
        <QuestionArea questionData={currentQuestion} />
      </div>

      {/* 4. 입력 영역 */}
      <div style={{ height: '35%' }}>
        <InputArea 
          correctAnswer={currentQuestion.answer} 
          onCorrect={handleCorrect} 
          onWrong={handleWrong} 
        />
      </div>

      {/* 5. [추가] 결과 오버레이 (Win/Lose Modal) */}
      {isGameOver && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ 
              fontSize: '3rem', 
              marginBottom: '20px', 
              color: isWin ? '#ffcc00' : '#ff4d4d',
              textShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}>
              {isWin ? "YOU WIN! 🏆" : "Try Again... 💀"}
            </h2>
            
            <p style={{ color: '#ccc', marginBottom: '30px' }}>
              {isWin ? "Great job! You defeated the enemy." : "Don't give up! Practice makes perfect."}
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              {isWin ? (
                /* 승리 시: 계속하기 버튼 */
                <button style={primaryBtnStyle} onClick={onBack}>CONTINUE</button>
              ) : (
                /* 패배 시: 다시하기 및 그만하기 버튼 */
                <>
                  <button style={primaryBtnStyle} onClick={handleRetry}>RETRY</button>
                  <button style={secondaryBtnStyle} onClick={onBack}>QUIT</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

// --- 스타일 정의 ---

const layoutStyle = {
  display: 'flex', flexDirection: 'column',
  height: '100vh', width: '100vw',
  overflow: 'hidden', backgroundColor: '#f0f0f0',
  position: 'relative'
};

const hudStyle = {
  height: '5%', display: 'flex', justifyContent: 'space-between',
  padding: '0 20px', alignItems: 'center',
  background: '#051937', zIndex: 10
};

const overlayStyle = {
  position: 'absolute', top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000, backdropFilter: 'blur(4px)'
};

const modalStyle = {
  textAlign: 'center', padding: '50px',
  borderRadius: '25px', background: '#1a1a2e',
  border: '3px solid #333', boxShadow: '0 0 40px rgba(0,0,0,0.7)',
  minWidth: '320px'
};

const primaryBtnStyle = {
  padding: '15px 35px', fontSize: '1.2rem', fontWeight: 'bold',
  borderRadius: '12px', border: 'none',
  background: '#2ecc71', color: '#fff', cursor: 'pointer',
  boxShadow: '0 4px 0 #27ae60'
};

const secondaryBtnStyle = {
  padding: '15px 35px', fontSize: '1.2rem', fontWeight: 'bold',
  borderRadius: '12px', border: '2px solid #fff',
  background: 'transparent', color: '#fff', cursor: 'pointer'
};

const backButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)',
  color: '#fff', borderRadius: '8px', cursor: 'pointer',
  fontSize: '1.2rem', padding: '2px 10px', display: 'flex', alignItems: 'center'
};

const shopButtonStyle = {
  background: '#ffcc00', border: 'none', borderRadius: '5px',
  padding: '5px 10px', fontWeight: 'bold', cursor: 'pointer'
};

export default StageGameScreen;