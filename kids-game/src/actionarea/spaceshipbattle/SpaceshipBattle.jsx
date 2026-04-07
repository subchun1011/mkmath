import React, { useEffect, useState } from 'react';
import './SpaceshipBattle.css';
import BattleShipSprite from '../../components/common/battleShipSprite'; 
import HealthBar from './HealthBar';
import ComboEffect from './ComboEffect'; 

const SpaceshipBattle = ({ 
  playerHP, 
  enemyHP, 
  maxHP = 100,
  actionState, 
  combo = 0,        
  weaponRow = 2,    
  missileCol = 0    
}) => {
  // 미사일 인덱스 (물리 0~4, 레이저 5~9)
  const missileIndex = weaponRow === 3 ? 5 + missileCol : missileCol;

  // 콤보에 따른 폭발 크기
  const explosionScale = 0.7 + (missileCol * 0.15);
  const [effectIndex, setEffectIndex] = useState(0);

  useEffect(() => {
    if (actionState === 'playerFire' || actionState === 'enemyFire') {
      // 4열 폭발 이미지 5종 중 하나를 랜덤 사용
      setEffectIndex(Math.floor(Math.random() * 5));
    }
  }, [actionState]);

  return (
    <div className="space-battle">
      {/* 🚀 웅장한 콤보 효과 (화면 중앙) */}
      <ComboEffect combo={combo} />

      <div className="space-battle__status-layer">
        <div className="space-battle__status-panel space-battle__status-panel--player">
          <HealthBar
            currentHP={playerHP}
            maxHP={maxHP}
            isPlayer={true}
            label="HERO"
          />
        </div>

        <div className="space-battle__status-panel space-battle__status-panel--enemy">
          <HealthBar
            currentHP={enemyHP}
            maxHP={maxHP}
            isPlayer={false}
            label="ALIEN"
          />
        </div>
      </div>

      <div className="space-battle__ships">
        
        {/* --- 1. 플레이어 비행선 (HERO) --- */}
        <div className={`space-battle__ship 
          ${actionState === 'playerFire' ? 'fire-recoil-p' : ''} 
          ${actionState === 'enemyFire' ? 'hit-shake' : ''}`}>
          <div className="ship-sprite-wrapper">
            {/* 비행선 고정 출력 */}
            <BattleShipSprite type="player" scale={0.25} />
            
            {/* 플레이어 피격 폭발 레이어 */}
            {actionState === 'enemyFire' && (
              <div className="explosion-layer">
                <BattleShipSprite type="effect" index={effectIndex} scale={0.8} />
              </div>
            )}
          </div>
        </div>

        <div className="vs-logo">VS</div>

        {/* --- 2. 컴퓨터 비행선 (ALIEN) --- */}
        <div className={`space-battle__ship 
          ${actionState === 'enemyFire' ? 'fire-recoil-e' : ''} 
          ${actionState === 'playerFire' ? 'hit-shake' : ''}`}>
          <div className="ship-sprite-wrapper">
            <BattleShipSprite type="enemy" scale={0.25} />
            
            {/* 적군 피격 폭발 레이어 (미사일에 맞춰 커짐) */}
            {actionState === 'playerFire' && (
              <div className="explosion-layer">
                <BattleShipSprite 
                  type="effect" 
                  index={effectIndex} 
                  scale={explosionScale} 
                />
              </div>
            )}
          </div>
        </div>

        {/* --- 3. 미사일 애니메이션 --- */}
        {actionState === 'playerFire' && (
          <div className="space-battle__missile animate-player">
            <BattleShipSprite 
              type="missile" 
              index={missileIndex} 
              scale={0.35 + (missileCol * 0.05)} 
              firingFrom="player"
            />
          </div>
        )}

        {actionState === 'enemyFire' && (
          <div className="space-battle__missile animate-enemy">
            <BattleShipSprite type="missile" index={0} scale={0.3} firingFrom="enemy" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceshipBattle;
