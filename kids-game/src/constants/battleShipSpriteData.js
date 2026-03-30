// src/constants/battleShipSpriteData.js
import battleShipImg from '../assets/images/battleShipImg.png'; 

export const BATTLE_SHIP_SPRITE_DATA = {
  url: battleShipImg, 
  size: 1024, // 새 이미지 해상도에 맞춰 1024로 수정
  
  // 1. 비행선 좌표 (1열: 파란색 유저 / 초록색 에일리언)
  ships: {
    player: { x: 260, y: 100, w: 210, h: 180 }, 
    enemy: { x: 550, y: 100, w: 210, h: 180 }, 
  },
  
  // 2. 미사일 10종 좌표 (2열: 물리 미사일 5종 / 3열: 에너지 레이저 5종)
  // 모든 미사일이 이미 수평이므로 rotation은 0으로 설정합니다.
  missiles: [
    // --- 물리 미사일 Tier 1 ~ 5 ---
    { x: 60,  y: 360, w: 110, h: 80,  rotation: 0 }, 
    { x: 245, y: 360, w: 120, h: 90,  rotation: 0 }, 
    { x: 430, y: 355, w: 135, h: 100, rotation: 0 }, 
    { x: 615, y: 355, w: 140, h: 100, rotation: 0 }, 
    { x: 795, y: 345, w: 205, h: 140, rotation: 0 }, 
    
    // --- 레이저 미사일 Tier 6 ~ 10 (가메하메하 스타일) ---
    { x: 15,  y: 635, w: 180, h: 40,  rotation: 0 }, 
    { x: 215, y: 620, w: 190, h: 80,  rotation: 0 }, 
    { x: 420, y: 610, w: 160, h: 100, rotation: 0 }, 
    { x: 600, y: 590, w: 160, h: 140, rotation: 0 }, 
    { x: 780, y: 520, w: 240, h: 250, rotation: 0 }  // 왕왕 큰 레이저!
  ],
  
  // 3. 피격 이펙트 5종 좌표 (4열)
  effects: [
    { x: 120, y: 830, w: 110, h: 120 },
    { x: 265, y: 825, w: 140, h: 140 },
    { x: 430, y: 800, w: 160, h: 180 },
    { x: 605, y: 810, w: 160, h: 160 },
    { x: 760, y: 810, w: 200, h: 180 }
  ]
};