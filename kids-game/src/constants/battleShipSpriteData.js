// src/constants/battleShipSpriteData.js

import battleShipImg from '../assets/images/battleShipImg.png'; 

export const BATTLE_SHIP_SPRITE_DATA = {
  url: battleShipImg, 
  size: 512, 
  
  // 1. 비행선 좌표 (이미지 상단 배치 분석) ⭐
  ships: {
    // [최종보정] y값을 142에서 75로 크게 올렸습니다. 
    // 이제 비행선의 윗부분부터 제대로 보일 것입니다.
    player: { x: 165, y: 75, w: 100, h: 90 }, 
    enemy: { x: 265, y: 75, w: 100, h: 90 }, 
  },
  
  // 2. 미사일 10종 좌표 (비행선 바로 아래 줄로 이동) ⭐
  // y값을 235에서 185 지점으로 올렸습니다.
  missiles: [
    { x: 102, y: 185, w: 32, h: 50, rotation: 90 }, // Level 1 (Up)
    { x: 135, y: 185, w: 32, h: 50, rotation: 90 }, // Level 2
    { x: 170, y: 185, w: 32, h: 50, rotation: 45 }, // Level 3
    { x: 205, y: 185, w: 32, h: 50, rotation: 0 },  // Level 4
    { x: 240, y: 185, w: 32, h: 50, rotation: 45 }, // Level 5
    { x: 275, y: 185, w: 32, h: 50, rotation: 45 }, // Level 6
    { x: 310, y: 185, w: 32, h: 50, rotation: 90 }, // Level 7
    { x: 345, y: 185, w: 32, h: 50, rotation: 45 }, // Level 8
    { x: 380, y: 185, w: 32, h: 50, rotation: 0 },  // Level 9
    { x: 415, y: 185, w: 32, h: 50, rotation: 0 }   // Level 10
  ],
  
  // 3. 피격 이펙트 5종 좌표 (미사일 아래 줄로 이동) ⭐
  // y값을 315에서 280 지점으로 올렸습니다.
  effects: [
    { x: 125, y: 280, w: 60, h: 60 },
    { x: 180, y: 280, w: 60, h: 60 },
    { x: 235, y: 280, w: 60, h: 60 },
    { x: 290, y: 280, w: 60, h: 60 },
    { x: 345, y: 280, w: 60, h: 60 }
  ]
};