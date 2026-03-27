import React from 'react';
import RobotCharacter from './RobotCharacter';
import './ActionArea.css';

const ActionArea = ({ playerStats, enemyStats, gameState }) => {
  // gameState: 'idle', 'playerAttack', 'enemyAttack'
  
  return (
    <div className="battle-field">
      {/* 좌측: 플레이어 로봇 (사용자) */}
      <div className={`robot-wrapper player ${gameState === 'playerAttack' ? 'attacking' : ''}`}>
        <RobotCharacter 
          type="player" 
          parts={playerStats.parts} 
          isHurt={gameState === 'enemyAttack'} 
        />
        <div className="name-tag">나의 로봇</div>
      </div>

      {/* 중앙: 대결 이펙트 영역 */}
      <div className="vs-effect">VS</div>

      {/* 우측: 컴퓨터 로봇 (적) */}
      <div className={`robot-wrapper enemy ${gameState === 'enemyAttack' ? 'attacking' : ''}`}>
        <RobotCharacter 
          type="enemy" 
          parts={enemyStats.parts} 
          isHurt={gameState === 'playerAttack'} 
        />
        <div className="name-tag">컴퓨터 로봇</div>
      </div>
    </div>
  );
};

export default ActionArea;