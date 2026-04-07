import React from 'react';
import { BATTLE_SHIP_SPRITE_DATA } from '../../constants/battleShipSpriteData.js';

/**
 * @param {string} type - 'player', 'enemy', 'missile', 'effect'
 * @param {number} index - 미사일(0~9) 또는 이펙트(0~4)의 순서
 * @param {number} scale - 이미지 확대 비율
 * @param {string} firingFrom - 미사일 발사 주체 ('player', 'enemy')
 * @param {object} style - 추가 커스텀 스타일
 */
const BattleShipSprite = ({ type, index = 0, scale = 1, firingFrom, style = {} }) => {
  let data;
  
  // 타입에 따른 데이터 매핑
  if (type === 'player') {
    data = BATTLE_SHIP_SPRITE_DATA.ships.player;
  } else if (type === 'enemy') {
    data = BATTLE_SHIP_SPRITE_DATA.ships.enemy;
  } else if (type === 'missile') {
    data = BATTLE_SHIP_SPRITE_DATA.missiles[index] || BATTLE_SHIP_SPRITE_DATA.missiles[0];
  } else if (type === 'effect') {
    data = BATTLE_SHIP_SPRITE_DATA.effects[index] || BATTLE_SHIP_SPRITE_DATA.effects[0];
  }

  if (!data) return null;

  // --- 발사 방향에 따른 회전 각도 계산 ---
  const baseRotation = data.rotation || 0; 
  let finalRotation = baseRotation;

  if (type === 'missile') {
    if (firingFrom === 'player') {
      finalRotation = baseRotation; // 오른쪽 방향 그대로
    } else if (firingFrom === 'enemy') {
      finalRotation = baseRotation + 180; // 왼쪽 방향으로 반전
    }
  }

  const spriteStyle = {
    width: `${data.w}px`,
    height: `${data.h}px`,
    backgroundImage: `url(${BATTLE_SHIP_SPRITE_DATA.url})`,
    backgroundPosition: `-${data.x}px -${data.y}px`,
    backgroundSize: `${BATTLE_SHIP_SPRITE_DATA.size}px ${BATTLE_SHIP_SPRITE_DATA.size}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated', // 도트의 선명함 유지
    transform: `scale(${scale}) rotate(${finalRotation}deg)`,
    transformOrigin: 'center center',
    display: 'inline-block',
    transition: 'transform 0.1s ease-out', // 부드러운 움직임을 위한 추가
    ...style
  };

  return <div className={`battleship-sprite-${type}`} style={spriteStyle} />;
};

export default BattleShipSprite;