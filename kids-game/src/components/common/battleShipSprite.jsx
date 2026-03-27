// src/components/common/battleShipSprite.jsx
import React from 'react';
import { BATTLE_SHIP_SPRITE_DATA } from '../../constants/battleShipSpriteData.js';

/**
 * @param {string} type - 'player', 'enemy', 'missile', 'effect'
 * @param {number} index - 미사일(0~9) 또는 이펙트(0~4)의 순서
 * @param {number} scale - 이미지 확대 비율
 * @param {string} firingFrom - 미사일 발사 주체 ('player', 'enemy') -> 회전 로직에 사용
 * @param {object} style - 추가 커스텀 스타일
 */
const BattleShipSprite = ({ type, index = 0, scale = 1, firingFrom, style = {} }) => {
  let data;
  
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

  // --- 발사 방향에 따른 최종 회전 각도 계산 (핵심 ⭐) ---
  // 1. 데이터에 정의된 "수평 오른쪽"으로 똑바로 정렬하기 위한 기본 회전값
  const baseRotation = data.rotation || 0; 
  let finalRotation = baseRotation;

  // 2. 누가 발사했는지에 따라 미사일을 최종 회전
  if (type === 'missile') {
    if (firingFrom === 'player') {
      // 플레이어는 오른쪽을 바라보므로, 데이터의 기본 회전값을 그대로 사용하여 "오른쪽"을 바라보게 함
      finalRotation = baseRotation;
    } else if (firingFrom === 'enemy') {
      // 적군은 왼쪽을 바라보므로, "오른쪽"을 바라보는 기본 상태에서 180도 더 회전시켜 "왼쪽"을 바라보게 함
      finalRotation = baseRotation + 180;
    }
  }

  const spriteStyle = {
    width: `${data.w}px`,
    height: `${data.h}px`,
    backgroundImage: `url(${BATTLE_SHIP_SPRITE_DATA.url})`,
    backgroundPosition: `-${data.x}px -${data.y}px`,
    backgroundSize: `${BATTLE_SHIP_SPRITE_DATA.size}px ${BATTLE_SHIP_SPRITE_DATA.size}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    // transform에 scale과 rotate를 함께 적용 (회전 기준점은 정중앙으로 설정)
    transform: `scale(${scale}) rotate(${finalRotation}deg)`,
    transformOrigin: 'center center', // 회전 기준점을 이미지 중앙으로 설정
    display: 'inline-block',
    ...style
  };

  return <div className={`battleship-sprite-${type}`} style={spriteStyle} />;
};

export default BattleShipSprite;