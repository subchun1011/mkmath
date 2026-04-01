import React, { useEffect, useState } from 'react';
import StageGameScreen from './StageGameScreen';
import SelectionScreen from './SelectionScreen'; // 새로 만든 선택 화면

function App() {
  useEffect(() => {
    const updateAppViewport = () => {
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

  // 1. 게임 전역 상태 관리
  const [view, setView] = useState('selection'); // 'selection' 또는 'game'
  const [gameConfig, setGameConfig] = useState(null); // { category, subCategory, level }
  const [coins, setCoins] = useState(0); 
  const [currentMissileTier, setCurrentMissileTier] = useState(1); 

  // 2. 코인 및 업그레이드 로직
  const earnCoins = (amount) => setCoins(prev => prev + amount);
  
  const upgradeMissile = (cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setCurrentMissileTier(prev => prev + 1);
      return true;
    }
    return false;
  };

  // 3. 화면 전환 함수
  const handleStartGame = (config) => {
    setGameConfig(config);
    setView('game');
  };

  const handleBackToMenu = () => {
    setView('selection');
    setGameConfig(null);
  };

  return (
    <div className="App">
      {view === 'selection' ? (
        /* --- [선택 화면] --- */
        <SelectionScreen onStartGame={handleStartGame} />
      ) : (
        /* --- [게임 화면] --- */
        <StageGameScreen 
          category={gameConfig.category}
          subCategory={gameConfig.subCategory}
          level={gameConfig.level}
          coins={coins} 
          onEarnCoin={() => earnCoins(10)} 
          missileTier={currentMissileTier}
          onUpgrade={upgradeMissile}
          onBack={handleBackToMenu} // 백버튼 클릭 시 메뉴로 이동
        />
      )}
    </div>
  );
}

export default App;
