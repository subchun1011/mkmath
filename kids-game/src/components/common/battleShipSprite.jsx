import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BATTLE_SHIP_SPRITE_DATA,
  SPRITE_DATA,
  calculateHpPercentage,
  getSpriteProps,
} from '../../constants/battleShipSpriteData.js';

function mapLegacyTypeToSpriteKey(type) {
  if (type === 'player') {
    return 'ship_player';
  }

  if (type === 'enemy') {
    return 'ship_enemy_sheet';
  }

  if (type === 'player-missile' || type === 'enemy-missile') {
    return 'missile_player_sheet';
  }

  return type;
}

function buildLegacyStyle(type, index, scale, firingFrom, overrideStyle) {
  let spriteData = null;

  if (type === 'player') {
    spriteData = BATTLE_SHIP_SPRITE_DATA.ships.player;
  } else if (type === 'enemy') {
    spriteData = BATTLE_SHIP_SPRITE_DATA.ships.enemy;
  } else if (type === 'missile') {
    spriteData =
      BATTLE_SHIP_SPRITE_DATA.missiles[index] || BATTLE_SHIP_SPRITE_DATA.missiles[0];
  } else if (type === 'effect') {
    spriteData =
      BATTLE_SHIP_SPRITE_DATA.effects[index] || BATTLE_SHIP_SPRITE_DATA.effects[0];
  }

  if (!spriteData) {
    return { style: {}, spriteInfo: null };
  }

  let finalRotation = spriteData.rotation || 0;

  if ((type === 'missile' || type === 'enemy-missile') && firingFrom === 'enemy') {
    finalRotation += 180;
  }

  return {
    style: {
      width: `${spriteData.w}px`,
      height: `${spriteData.h}px`,
      backgroundImage: `url(${BATTLE_SHIP_SPRITE_DATA.url})`,
      backgroundPosition: `-${spriteData.x}px -${spriteData.y}px`,
      backgroundSize: `${BATTLE_SHIP_SPRITE_DATA.size}px ${BATTLE_SHIP_SPRITE_DATA.size}px`,
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
      transform: `scale(${scale}) rotate(${finalRotation}deg)`,
      transformOrigin: 'center center',
      display: 'inline-block',
      opacity: 1,
      transition: 'transform 0.1s ease-out',
      ...overrideStyle,
    },
    spriteInfo: {
      ...spriteData,
      url: BATTLE_SHIP_SPRITE_DATA.url,
      scaledWidth: spriteData.w * scale,
      scaledHeight: spriteData.h * scale,
      hpPercent: calculateHpPercentage(100, 100),
    },
  };
}

const BattleShipSprite = ({
  type,
  state = 'idle',
  index = 0,
  scale = 1,
  style: overrideStyle = {},
  animationIterationCount = 'infinite',
  onAnimationEnd,
  firingFrom,
  ...otherProps
}) => {
  const [animationCss, setAnimationCss] = useState('');
  const [spriteInfo, setSpriteInfo] = useState(null);
  const [elementStyle, setElementStyle] = useState({});
  const elementRef = useRef(null);
  const effectTimeoutRef = useRef(null);
  const imageCheckRef = useRef({ url: null });
  const normalizedType = useMemo(() => mapLegacyTypeToSpriteKey(type), [type]);
  const elementId = useMemo(
    () => `sprite-${type}-${state}-${Math.random().toString(36).slice(2, 7)}`,
    [state, type],
  );

  const handleAnimationEnd = (event) => {
    if (onAnimationEnd) {
      onAnimationEnd(event);
    }
  };

  useEffect(() => {
    const canUseSpriteProps = Boolean(SPRITE_DATA[normalizedType]);

    if (canUseSpriteProps) {
      const shouldGlow =
        normalizedType.startsWith('ship_') ||
        normalizedType.startsWith('missile_') ||
        normalizedType === 'energy_core_sheet' ||
        normalizedType === 'cockpit_hud_fixed' ||
        normalizedType === 'hologram_screen';

      const mergedStyle = {
        imageRendering: 'pixelated',
        display: 'inline-block',
        opacity: 1,
        mixBlendMode: shouldGlow ? 'screen' : 'normal',
        ...overrideStyle,
      };
      const {
        style,
        animationCss: animCss,
        spriteInfo: info,
      } = getSpriteProps(normalizedType, state, {
        scale,
        animationIterationCount,
        style: mergedStyle,
      });

      setAnimationCss(animCss || '');
      setSpriteInfo(info);
      setElementStyle(style);
    } else {
      const { style, spriteInfo } = buildLegacyStyle(
        type,
        index,
        scale,
        firingFrom,
        overrideStyle,
      );

      setAnimationCss('');
      setSpriteInfo(spriteInfo);
      setElementStyle(style);
    }

    const currentElement = elementRef.current;

    if (currentElement && onAnimationEnd && animationCss) {
      currentElement.addEventListener('animationend', handleAnimationEnd);
    }

    if (type === 'effect' && onAnimationEnd && !animationCss) {
      window.clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = window.setTimeout(() => {
        onAnimationEnd({ type: 'animationend', target: currentElement });
      }, 200);
    }

    return () => {
      if (currentElement && onAnimationEnd && animationCss) {
        currentElement.removeEventListener('animationend', handleAnimationEnd);
      }

      window.clearTimeout(effectTimeoutRef.current);
    };
  }, [
    animationCss,
    animationIterationCount,
    firingFrom,
    index,
    normalizedType,
    onAnimationEnd,
    overrideStyle,
    scale,
    state,
    type,
  ]);

  useEffect(() => {
    const imageUrl =
      spriteInfo?.url ||
      (elementStyle.backgroundImage || '').replace(/^url\((['"]?)(.*)\1\)$/, '$2');

    if (!imageUrl || imageCheckRef.current.url === imageUrl) {
      return undefined;
    }

    imageCheckRef.current.url = imageUrl;

    const testImage = new window.Image();
    testImage.onerror = () => {
      console.warn(
        `BattleShipSprite: Failed to load image for type="${type}" state="${state}". Check this URL in the browser: ${imageUrl}`,
      );
    };
    testImage.src = imageUrl;

    return () => {
      testImage.onerror = null;
    };
  }, [elementStyle.backgroundImage, spriteInfo?.url, state, type]);

  if (!spriteInfo) {
    return null;
  }

  const renderAsImage =
    Boolean(SPRITE_DATA[normalizedType]) &&
    (spriteInfo.frames || 1) === 1 &&
    !animationCss &&
    !spriteInfo.states;

  if (renderAsImage) {
    const {
      backgroundImage,
      backgroundPosition,
      backgroundRepeat,
      backgroundSize,
      ...imageStyle
    } = elementStyle;

    return (
      <img
        ref={elementRef}
        id={elementId}
        className={`sprite ${type} ${state}`}
        src={spriteInfo.url}
        alt=""
        draggable={false}
        style={{
          ...imageStyle,
          objectFit: 'contain',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        {...otherProps}
      />
    );
  }

  return (
    <>
      {animationCss && <style>{animationCss}</style>}

      <div
        ref={elementRef}
        id={elementId}
        className={`sprite ${type} ${state}`}
        style={elementStyle}
        {...otherProps}
      />
    </>
  );
};

export default BattleShipSprite;
