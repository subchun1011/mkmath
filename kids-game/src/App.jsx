import React, { useEffect, useState } from 'react';
import StageGameScreen from './StageGameScreen';
import SelectionScreen from './SelectionScreen';

function App() {
  useEffect(() => {
    // 1. 모바일 브라우저 주소창 문제를 해결하기 위한 높이 계산
    const updateAppViewport = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    updateAppViewport();
    window.addEventListener('resize', updateAppViewport);
    window.addEventListener('orientationchange', updateAppViewport);

    return () => {
      window.removeEventListener('resize', updateAppViewport);
      window.removeEventListener('orientationchange', updateAppViewport);
    };
  }, []);

  // 전역 상태 관리
  const [view, setView] = useState('selection'); 
  const [gameConfig, setGameConfig] = useState(null); 
  const [coins, setCoins] = useState(0); 
  const [currentMissileTier, setCurrentMissileTier] = useState(1); 

  const earnCoins = (amount) => setCoins(prev => prev + amount);
  
  const upgradeMissile = (cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setCurrentMissileTier(prev => prev + 1);
      return true;
    }
    return false;
  };

  const handleStartGame = (config) => {
    setGameConfig(config);
    setView('game');
  };

  const handleBackToMenu = () => {
    setView('selection');
    setGameConfig(null);
  };

  return (
    /* 2. 전역 스타일 적용: 스크롤 방지 및 꽉 찬 화면 */
    <div className="App" style={{ 
      width: '100%', 
      height: 'var(--app-height, 100dvh)', 
      overflow: 'hidden',
      position: 'fixed', // 화면 출렁임 방지
      top: 0, left: 0 
    }}>
      {view === 'selection' ? (
        <SelectionScreen onStartGame={handleStartGame} />
      ) : (
        <StageGameScreen 
          category={gameConfig.category}
          subCategory={gameConfig.subCategory}
          level={gameConfig.level}
          coins={coins} 
          onEarnCoin={() => earnCoins(10)} 
          missileTier={currentMissileTier}
          onUpgrade={upgradeMissile}
          onBack={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;