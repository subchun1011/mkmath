import battleShipImg from '../assets/images/battleShipImg.png';
import cockpitHudFixedPng from '../assets/images/battleShipIMG/cockpit_hud_fixed.png';
import energyCoreSheetPng from '../assets/images/battleShipIMG/energy_core_sheet.png';
import hologramScreenPng from '../assets/images/battleShipIMG/hologram_screen.png';
import luckyBoxPng from '../assets/images/battleShipIMG/lucky_box.png';
import missilePlayerSheetPng from '../assets/images/battleShipIMG/missile_player_sheet.png';
import shipEnemySheetPng from '../assets/images/battleShipIMG/ship_enemy_sheet.png';
import shipPlayerPng from '../assets/images/battleShipIMG/ship_player.png';

// 기본 이미지 경로
const warnedSpriteMessages = new Set();

function warnOnce(key, message) {
  if (warnedSpriteMessages.has(key)) {
    return;
  }

  warnedSpriteMessages.add(key);

  console.warn(message);
}

const BASE_SPRITE_PATH = 'src/assets/images/battleShipIMG/';
const SPRITE_URLS = {
  'cockpit_hud_fixed.png': cockpitHudFixedPng,
  'energy_core_sheet.png': energyCoreSheetPng,
  'hologram_screen.png': hologramScreenPng,
  'lucky_box.png': luckyBoxPng,
  'missile_player_sheet.png': missilePlayerSheetPng,
  'ship_enemy_sheet.png': shipEnemySheetPng,
  'ship_player.png': shipPlayerPng,
};

// 스프라이트 시트 URL 조합 함수
const getSpriteUrl = (filename) => {
  if (!filename) {
    warnOnce(
      `sprite-file:${filename}`,
      `BattleShipSpriteData: "${filename}" could not be resolved from ${BASE_SPRITE_PATH}.`,
    );
    return '';
  }

  const resolvedUrl = SPRITE_URLS[filename];

  if (!resolvedUrl) {
    warnOnce(
      `sprite-file:${filename}`,
      `BattleShipSpriteData: "${filename}" could not be resolved from ${BASE_SPRITE_PATH}.`,
    );
  }

  return resolvedUrl || '';
};

// --- 스프라이트 데이터 객체 ---
export const SPRITE_DATA = {};

const SHIP_SHEET_FRAME_WIDTH = 100;
const SHIP_SHEET_FRAME_HEIGHT = 100;
const SHIP_SHEET_COLS = 5;
const SHIP_SHEET_ROWS = 4;

// Player Ship (Hero) - 5x4 sprite sheet
const shipPlayerInfo = {
  url: getSpriteUrl('ship_player.png'),
  width: SHIP_SHEET_FRAME_WIDTH,
  height: SHIP_SHEET_FRAME_HEIGHT,
  frames: SHIP_SHEET_COLS * SHIP_SHEET_ROWS,
  frameWidth: SHIP_SHEET_FRAME_WIDTH,
  frameHeight: SHIP_SHEET_FRAME_HEIGHT,
  animationSpeed: 0.1,
  x: 0,
  y: 0,
  sheetWidth: SHIP_SHEET_FRAME_WIDTH * SHIP_SHEET_COLS,
  sheetHeight: SHIP_SHEET_FRAME_HEIGHT * SHIP_SHEET_ROWS,
  states: {
    still: {
      x: 0,
      y: 0,
      frames: 1,
      frameWidth: SHIP_SHEET_FRAME_WIDTH,
      frameHeight: SHIP_SHEET_FRAME_HEIGHT,
    },
    idle: {
      x: 0,
      y: 0,
      frames: 5,
      frameWidth: SHIP_SHEET_FRAME_WIDTH,
      frameHeight: SHIP_SHEET_FRAME_HEIGHT,
    },
    hit: {
      x: 0,
      y: SHIP_SHEET_FRAME_HEIGHT,
      frames: 5,
      frameWidth: SHIP_SHEET_FRAME_WIDTH,
      frameHeight: SHIP_SHEET_FRAME_HEIGHT,
    },
  },
};

// Enemy Ship Sheet - 4 rows, 5 columns per row
const ENEMY_FRAME_WIDTH = 100;
const ENEMY_FRAME_HEIGHT = 100;

const enemyShipSheetInfo = {
  url: getSpriteUrl('ship_enemy_sheet.png'),
  width: ENEMY_FRAME_WIDTH,
  height: ENEMY_FRAME_HEIGHT,
  frames: 20,
  frameWidth: ENEMY_FRAME_WIDTH,
  frameHeight: ENEMY_FRAME_HEIGHT,
  animationSpeed: 0.1,
  x: 0,
  y: 0,
  sheetWidth: ENEMY_FRAME_WIDTH * 5,
  sheetHeight: ENEMY_FRAME_HEIGHT * 4,
  states: {
    still: {
      x: 0,
      y: 0,
      frames: 1,
      frameWidth: ENEMY_FRAME_WIDTH,
      frameHeight: ENEMY_FRAME_HEIGHT,
    },
    idle: {
      x: 0,
      y: 0,
      frames: 5,
      frameWidth: ENEMY_FRAME_WIDTH,
      frameHeight: ENEMY_FRAME_HEIGHT,
    },
    hit: {
      x: 0,
      y: ENEMY_FRAME_HEIGHT,
      frames: 5,
      frameWidth: ENEMY_FRAME_WIDTH,
      frameHeight: ENEMY_FRAME_HEIGHT,
    },
  },
};

// Player Missile Sheet - Horizontal animation, 4 frames
const PLAYER_MISSILE_FRAME_WIDTH = 122;
const PLAYER_MISSILE_FRAME_HEIGHT = 409;

const missilePlayerSheetInfo = {
  url: getSpriteUrl('missile_player_sheet.png'),
  width: PLAYER_MISSILE_FRAME_WIDTH,
  height: PLAYER_MISSILE_FRAME_HEIGHT,
  frames: 5,
  frameWidth: PLAYER_MISSILE_FRAME_WIDTH,
  frameHeight: PLAYER_MISSILE_FRAME_HEIGHT,
  animationSpeed: 0.05,
  x: 0,
  y: 0,
  sheetWidth: 610,
  sheetHeight: PLAYER_MISSILE_FRAME_HEIGHT,
  states: {
    tier1: { x: 0, y: 0, frames: 1, frameWidth: PLAYER_MISSILE_FRAME_WIDTH, frameHeight: PLAYER_MISSILE_FRAME_HEIGHT },
    tier2: { x: PLAYER_MISSILE_FRAME_WIDTH, y: 0, frames: 1, frameWidth: PLAYER_MISSILE_FRAME_WIDTH, frameHeight: PLAYER_MISSILE_FRAME_HEIGHT },
    tier3: { x: PLAYER_MISSILE_FRAME_WIDTH * 2, y: 0, frames: 1, frameWidth: PLAYER_MISSILE_FRAME_WIDTH, frameHeight: PLAYER_MISSILE_FRAME_HEIGHT },
    tier4: { x: PLAYER_MISSILE_FRAME_WIDTH * 3, y: 0, frames: 1, frameWidth: PLAYER_MISSILE_FRAME_WIDTH, frameHeight: PLAYER_MISSILE_FRAME_HEIGHT },
    tier5: { x: PLAYER_MISSILE_FRAME_WIDTH * 4, y: 0, frames: 1, frameWidth: PLAYER_MISSILE_FRAME_WIDTH, frameHeight: PLAYER_MISSILE_FRAME_HEIGHT },
  },
};

// Energy Core Sheet - 5 stages of charge (horizontal)
const ENERGY_CORE_FRAME_WIDTH = 223.6;
const ENERGY_CORE_FRAME_HEIGHT = 223;

const energyCoreSheetInfo = {
  url: getSpriteUrl('energy_core_sheet.png'),
  width: ENERGY_CORE_FRAME_WIDTH,
  height: ENERGY_CORE_FRAME_HEIGHT,
  frames: 5,
  frameWidth: ENERGY_CORE_FRAME_WIDTH,
  frameHeight: ENERGY_CORE_FRAME_HEIGHT,
  animationSpeed: 0.1,
  x: 0,
  y: 0,
  sheetWidth: ENERGY_CORE_FRAME_WIDTH * 5,
  sheetHeight: ENERGY_CORE_FRAME_HEIGHT,
  states: {
    charging: {
      x: 0,
      y: 0,
      frames: 5,
      frameWidth: ENERGY_CORE_FRAME_WIDTH,
      frameHeight: ENERGY_CORE_FRAME_HEIGHT,
    },
    charged: {
      x: ENERGY_CORE_FRAME_WIDTH * 4,
      y: 0,
      frames: 1,
      frameWidth: ENERGY_CORE_FRAME_WIDTH,
      frameHeight: ENERGY_CORE_FRAME_HEIGHT,
    },
  },
};

// Fixed HUD Elements
const cockpitHudFixedInfo = {
  url: getSpriteUrl('cockpit_hud_fixed.png'),
  width: 669,
  height: 373,
  frames: 1,
  x: 0,
  y: 0,
  sheetWidth: 669,
  sheetHeight: 373,
};

const hologramScreenInfo = {
  url: getSpriteUrl('hologram_screen.png'),
  width: 578,
  height: 432,
  frames: 1,
  x: 0,
  y: 0,
  sheetWidth: 578,
  sheetHeight: 432,
};

const luckyBoxInfo = {
  url: getSpriteUrl('lucky_box.png'),
  width: 80,
  height: 80,
  frames: 1,
  x: 0,
  y: 0,
};

// --- Populate SPRITE_DATA ---
SPRITE_DATA.ship_player = shipPlayerInfo;
SPRITE_DATA.ship_enemy_sheet = enemyShipSheetInfo;
SPRITE_DATA.missile_player_sheet = missilePlayerSheetInfo;
SPRITE_DATA.energy_core_sheet = energyCoreSheetInfo;
SPRITE_DATA.cockpit_hud_fixed = cockpitHudFixedInfo;
SPRITE_DATA.hologram_screen = hologramScreenInfo;
SPRITE_DATA.lucky_box = luckyBoxInfo;

/**
 * 스프라이트 시트에서 특정 프레임의 스타일을 계산하는 함수
 * @param {string} spriteKey
 * @param {string} [stateKey]
 * @param {object} [options]
 * @returns {{ style: object, animationCss: string, spriteInfo: object | null }}
 */
export const getSpriteStyleProps = (spriteKey, stateKey, options = {}) => {
  const spriteConfig = SPRITE_DATA[spriteKey];

  if (!spriteConfig) {
    console.error(`Sprite key "${spriteKey}" not found in SPRITE_DATA.`);
    return { style: {}, animationCss: '', spriteInfo: null };
  }

  let spriteInfo = { ...spriteConfig };

  if (stateKey && spriteConfig.states && spriteConfig.states[stateKey]) {
    spriteInfo = { ...spriteConfig, ...spriteConfig.states[stateKey] };
  }

  const {
    url,
    width,
    height,
    frameWidth,
    frameHeight,
    frames = 1,
    animationSpeed,
    x = 0,
    y = 0,
  } = spriteInfo;

  const effectiveFrameWidth = frameWidth || width;
  const effectiveFrameHeight = frameHeight || height;
  const scale = options.scale || 1;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  const sheetTotalWidth = spriteConfig.sheetWidth || effectiveFrameWidth * frames;
  const sheetTotalHeight = spriteConfig.sheetHeight || effectiveFrameHeight;
  const initialBackgroundPosition = `${-x * scale}px ${-y * scale}px`;

  let animationCss = '';
  let animationProps = {};

  if (frames > 1 && animationSpeed !== undefined && animationSpeed !== null) {
    const animationName = `sprite-anim-${spriteKey}-${stateKey || 'default'}-${Math.random().toString(36).slice(2, 7)}`;
    const animationDuration = animationSpeed * frames;

    animationCss = `
@keyframes ${animationName} {
  0% { background-position: ${initialBackgroundPosition}; }
  ${Array.from({ length: frames }).map((_, index) => {
    const percent = ((index + 1) / frames) * 100;
    const frameX = x + index * effectiveFrameWidth;
    return `${percent}% { background-position: ${-frameX * scale}px ${-y * scale}px; }`;
  }).join('\n  ')}
  100% { background-position: ${-(x + (frames - 1) * effectiveFrameWidth) * scale}px ${-y * scale}px; }
}`;

    animationProps = {
      animationName,
      animationDuration: `${animationDuration}s`,
      animationTimingFunction: `steps(${frames})`,
      animationIterationCount: options.animationIterationCount || 'infinite',
      animationFillMode: 'forwards',
    };
  }

  const style = {
    backgroundImage: `url(${url})`,
    backgroundRepeat: 'no-repeat',
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    backgroundPosition: initialBackgroundPosition,
    backgroundSize: `${sheetTotalWidth * scale}px ${sheetTotalHeight * scale}px`,
    ...animationProps,
    ...options.style,
  };

  if (!url) {
    warnOnce(
      `sprite-url:${spriteKey}`,
      `BattleShipSpriteData: Sprite "${spriteKey}" resolved to an empty URL. Check browser console/network for 404 issues.`,
    );
  }

  if (!width || !height) {
    warnOnce(
      `sprite-size:${spriteKey}`,
      `BattleShipSpriteData: Sprite "${spriteKey}" has invalid dimensions width=${width}, height=${height}.`,
    );
  }

  return {
    style,
    animationCss,
    spriteInfo: {
      ...spriteInfo,
      url,
      scaledWidth,
      scaledHeight,
    },
  };
};

/**
 * 기존 코드와 동일한 이름의 헬퍼도 함께 제공
 */
export const getSpriteProps = (key, state, options = {}) =>
  getSpriteStyleProps(key, state, options);

/**
 * HP 비율 계산 (0-100)
 */
export const calculateHpPercentage = (currentHp, maxHp) => {
  if (!maxHp || maxHp <= 0) {
    return 0;
  }

  const percentage = (currentHp / maxHp) * 100;
  return Math.max(0, Math.min(100, percentage));
};

// ---------------------------------------------------------------------------
// Legacy compatibility export
// 현재 battleShipSprite.jsx가 이 구조를 사용하고 있으므로 함께 유지합니다.
// ---------------------------------------------------------------------------
export const BATTLE_SHIP_SPRITE_DATA = {
  url: battleShipImg,
  size: 1024,
  ships: {
    player: { x: 260, y: 100, w: 210, h: 180 },
    enemy: { x: 550, y: 100, w: 210, h: 180 },
  },
  missiles: [
    { x: 60, y: 360, w: 110, h: 80, rotation: 0 },
    { x: 245, y: 360, w: 120, h: 90, rotation: 0 },
    { x: 430, y: 355, w: 135, h: 100, rotation: 0 },
    { x: 615, y: 355, w: 140, h: 100, rotation: 0 },
    { x: 795, y: 345, w: 205, h: 140, rotation: 0 },
    { x: 15, y: 635, w: 180, h: 40, rotation: 0 },
    { x: 215, y: 620, w: 190, h: 80, rotation: 0 },
    { x: 420, y: 610, w: 160, h: 100, rotation: 0 },
    { x: 600, y: 590, w: 160, h: 140, rotation: 0 },
    { x: 780, y: 520, w: 240, h: 250, rotation: 0 },
  ],
  effects: [
    { x: 120, y: 830, w: 110, h: 120 },
    { x: 265, y: 825, w: 140, h: 140 },
    { x: 430, y: 800, w: 160, h: 180 },
    { x: 605, y: 810, w: 160, h: 160 },
    { x: 760, y: 810, w: 200, h: 180 },
  ],
};

export default {
  BASE_SPRITE_PATH,
  SPRITE_DATA,
  BATTLE_SHIP_SPRITE_DATA,
  getSpriteStyleProps,
  getSpriteProps,
  calculateHpPercentage,
};
