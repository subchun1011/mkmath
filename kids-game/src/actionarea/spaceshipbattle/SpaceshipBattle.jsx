// src/actionarea/spaceshipbattle/SpaceshipBattle.jsx
import React from 'react';
import './SpaceshipBattle.css';
// [주의] 파일 시스템 에러 방지를 위해 소문자 b로 시작하는 경로를 사용합니다.
import BattleShipSprite from '../../components/common/BattleShipSprite'; 

/**
 * @param {number} playerHP - 플레이어 체력 (0~100)
 * @param {number} enemyHP - 적 체력 (0~100)
 * @param {string} actionState - 현재 액션 상태 ('playerFire', 'enemyFire', 'idle')
 * @param {number} missileTier - 현재 장착된 미사일 레벨 (1~10)
 */
const SpaceshipBattle = ({ playerHP, enemyHP, actionState, missileTier = 1 }) => {
  return (
    <div className="space-battle">
      <div className="space-battle__ships">
        
        {/* 플레이어 비행선 */}
        <div className={`space-battle__ship space-battle__ship--player ${actionState === 'playerFire' ? 'fire-recoil-p' : ''}`}>
          <div className="space-battle__hp-bar">
            <div className="space-battle__hp-fill" style={{ width: `${playerHP}%` }} />
          </div>
          <div className="ship-sprite-wrapper">
            <BattleShipSprite type="player" scale={1.2} />
          </div>
        </div>

        <div className="vs-logo">VS</div>

        {/* 컴퓨터 비행선 */}
        <div className={`space-battle__ship space-battle__ship--enemy ${actionState === 'enemyFire' ? 'fire-recoil-e' : ''}`}>
          <div className="space-battle__hp-bar">
            <div className="space-battle__hp-fill" style={{ width: `${enemyHP}%` }} />
          </div>
          <div className="ship-sprite-wrapper">
            <BattleShipSprite type="enemy" scale={1.2} />
          </div>
        </div>

        {/* 미사일 연출 (Prop 전달 추가 ⭐) */}
        {actionState === 'playerFire' && (
          <div className="space-battle__missile animate-player">
            {/* firingFrom="player"를 전달하여 "오른쪽"을 바라보게 함 */}
            <BattleShipSprite 
              type="missile" 
              index={missileTier - 1} 
              scale={1} 
              firingFrom="player" 
            />
          </div>
        )}

        {actionState === 'enemyFire' && (
          <div className="space-battle__missile animate-enemy">
            {/* firingFrom="enemy"를 전달하여 "왼쪽"을 바라보게 함 */}
            <BattleShipSprite 
              type="missile" 
              index={0} 
              scale={1} 
              firingFrom="enemy" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceshipBattle;