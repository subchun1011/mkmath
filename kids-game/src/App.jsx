import React, { useEffect, useState } from 'react';
import StageGameScreen from './StageGameScreen';
import SelectionScreen from './SelectionScreen';
import { CoinProvider } from './coins/CoinContext'; // ⭐ 1. CoinProvider 임포트

function AppContent() {
  // 전역 상태 관리 (코인 관련 지역 상태는 제거되었습니다)
  const [view, setView] = useState('selection'); 
  const [gameConfig, setGameConfig] = useState(null); 
  const [currentMissileTier, setCurrentMissileTier] = useState(1); 

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
    setView('game');
  };

  const handleBackToMenu = () => {
    setView('selection');
    setGameConfig(null);
  };

  return (
    <div className="App" style={{ 
      width: '100%', 
      height: 'var(--app-height, 100dvh)', 
      overflow: 'hidden',
      position: 'fixed', 
      top: 0, left: 0 
    }}>
      {view === 'selection' ? (
        <SelectionScreen onStartGame={handleStartGame} />
      ) : (
        <StageGameScreen 
          category={gameConfig.category}
          subCategory={gameConfig.subCategory}
          level={gameConfig.level}
          // ⭐ 코인 관련 데이터는 이제 StageGameScreen 내부에서 useCoins()로 직접 가져옵니다.
          missileTier={currentMissileTier}
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