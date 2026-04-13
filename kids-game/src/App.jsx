import React, { useEffect, useState } from 'react';
import StageGameScreen from './StageGameScreen';
import MathCrosswordScreen from './crossword/MathCrosswordScreen.jsx';
import SelectionScreen from './SelectionScreen';
import { CoinProvider } from './coins/CoinContext'; // ⭐ 1. CoinProvider 임포트

function AppContent() {
  const [scene, setScene] = useState('setup');
  const [gameConfig, setGameConfig] = useState(null); 

  useEffect(() => {
    // 모바일 브라우저 주소창 문제를 해결하기 위한 높이 계산
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

  const handleStartGame = (config) => {
    setGameConfig(config);
    setScene('battle');
  };

  const handleBackToMenu = () => {
    setScene('setup');
    setGameConfig(null);
  };

  const shouldShowSetup = scene !== 'battle' || !gameConfig;

  return (
    <div className="App" style={{ 
      width: '100%', 
      height: '100%',
      minHeight: '100dvh',
      overflow: 'hidden',
      backgroundColor: '#000000',
      position: 'fixed', 
      top: 0, left: 0 
    }}>
      {shouldShowSetup ? (
        <SelectionScreen onStartGame={handleStartGame} />
      ) : gameConfig?.experience === 'crossword' ? (
        <MathCrosswordScreen
          category={gameConfig.category}
          level={gameConfig.level}
          onBack={handleBackToMenu}
        />
      ) : (
        <StageGameScreen 
          category={gameConfig.category}
          subCategory={gameConfig.subCategory}
          level={gameConfig.level}
          onBack={handleBackToMenu}
        />
      )}
    </div>
  );
}

// ⭐ 2. App 컴포넌트에서 전체를 CoinProvider로 감싸줍니다.
function App() {
  return (
    <CoinProvider>
      <AppContent />
    </CoinProvider>
  );
}

export default App;
