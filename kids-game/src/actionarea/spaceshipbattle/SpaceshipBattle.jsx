// src/actionarea/spaceshipbattle/SpaceshipBattle.jsx
import React from 'react';
import './SpaceshipBattle.css';
import BattleShipSprite from '../../components/common/BattleShipSprite'; 

const SpaceshipBattle = ({ playerHP, enemyHP, actionState, missileTier = 1 }) => {
  const MAX_HP = 100; 
  const pPercent = Math.max(0, Math.min(100, (playerHP / MAX_HP) * 100));
  const ePercent = Math.max(0, Math.min(100, (enemyHP / MAX_HP) * 100));

  // 💥 미사일 레벨(Tier)에 따른 폭발 고도화 로직
  // 레벨이 높을수록 폭발이 커집니다 (기본 0.7 + 티어당 0.1씩 추가)
  const explosionScale = 0.7 + (missileTier * 0.1);
  // 미사일 레벨에 따라 폭발 종류(스프라이트 인덱스 0~4)를 다르게 선택
  const effectIndex = Math.min(4, Math.floor((missileTier - 1) / 2));

  return (
    <div className="space-battle">
      <div className="space-battle__ships">
        
        {/* --- 1. 플레이어 비행선 영역 --- */}
        <div className={`space-battle__ship 
          ${actionState === 'playerFire' ? 'fire-recoil-p' : ''} 
          ${actionState === 'enemyFire' ? 'hit-shake' : ''}`}> {/* 👈 적이 쏠 때 내가 흔들림! */}
          
          <div className="space-battle__hp-bar">
            <div className="space-battle__hp-fill" style={{ width: `${pPercent}%` }} />
          </div>
          
          <div className="ship-sprite-wrapper">
            <BattleShipSprite type="player" scale={0.4} />
            
            {/* 💥 플레이어 피격 시 폭발 레이어 (요구사항 2 반영) */}
            {actionState === 'enemyFire' && (
              <div className="explosion-layer">
                <BattleShipSprite type="effect" index={0} scale={0.8} />
              </div>
            )}
          </div>
        </div>

        <div className="vs-logo">VS</div>

        {/* --- 2. 컴퓨터 비행선 영역 --- */}
        <div className={`space-battle__ship 
          ${actionState === 'enemyFire' ? 'fire-recoil-e' : ''} 
          ${actionState === 'playerFire' ? 'hit-shake' : ''}`}> {/* 👈 내가 쏠 때 적이 흔들림! */}
          
          <div className="space-battle__hp-bar">
            <div className="space-battle__hp-fill" style={{ width: `${ePercent}%` }} />
          </div>
          
          <div className="ship-sprite-wrapper">
            <BattleShipSprite type="enemy" scale={0.4} />
            
            {/* 💥 적 피격 시 폭발 레이어 (요구사항 2, 3 반영) */}
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

        {/* --- 3. 미사일 비행 애니메이션 --- */}
        {actionState === 'playerFire' && (
          <div className="space-battle__missile animate-player">
            <BattleShipSprite type="missile" index={missileTier - 1} scale={0.4} firingFrom="player" />
          </div>
        )}

        {actionState === 'enemyFire' && (
          <div className="space-battle__missile animate-enemy">
            <BattleShipSprite type="missile" index={0} scale={0.4} firingFrom="enemy" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceshipBattle;