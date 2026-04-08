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

const transparentSpriteCache = new Map();

function shouldMakeBlackTransparent(normalizedType, type) {
  return (
    normalizedType.startsWith('ship_') ||
    normalizedType.startsWith('missile_') ||
    normalizedType === 'energy_core_sheet' ||
    normalizedType === 'cockpit_hud_fixed' ||
    normalizedType === 'hologram_screen' ||
    type === 'effect'
  );
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
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const elementRef = useRef(null);
  const effectTimeoutRef = useRef(null);
  const imageCheckRef = useRef({ url: null });
  const normalizedType = useMemo(() => mapLegacyTypeToSpriteKey(type), [type]);
  const styleKey = useMemo(() => JSON.stringify(overrideStyle || {}), [overrideStyle]);
  const elementId = useMemo(
    () => `sprite-${type}-${state}-${Math.random().toString(36).slice(2, 7)}`,
    [state, type],
  );

  const handleAnimationEnd = (event) => {
    if (onAnimationEnd) {
      onAnimationEnd(event);
    }
  };

  const spriteRenderData = useMemo(() => {
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

      return {
        animationCss: animCss || '',
        spriteInfo: info,
        elementStyle: style,
      };
    } else {
      const { style, spriteInfo } = buildLegacyStyle(
        type,
        index,
        scale,
        firingFrom,
        overrideStyle,
      );

      return {
        animationCss: '',
        spriteInfo,
        elementStyle: style,
      };
    }
  }, [
    animationIterationCount,
    firingFrom,
    index,
    normalizedType,
    overrideStyle,
    scale,
    state,
    styleKey,
    type,
  ]);

  const { animationCss, spriteInfo, elementStyle } = spriteRenderData;

  useEffect(() => {
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
    onAnimationEnd,
    type,
  ]);

  useEffect(() => {
    const imageUrl =
      spriteInfo?.url ||
      (elementStyle.backgroundImage || '').replace(/^url\((['"]?)(.*)\1\)$/, '$2');

    if (!imageUrl) {
      setProcessedImageUrl('');
      return undefined;
    }

    const shouldProcessTransparency = shouldMakeBlackTransparent(normalizedType, type);

    if (!shouldProcessTransparency) {
      if (processedImageUrl !== imageUrl) {
        setProcessedImageUrl(imageUrl);
      }
      return undefined;
    }

    if (transparentSpriteCache.has(imageUrl)) {
      const cachedUrl = transparentSpriteCache.get(imageUrl);
      if (processedImageUrl !== cachedUrl) {
        setProcessedImageUrl(cachedUrl);
      }
      return undefined;
    }

    if (imageCheckRef.current.url === imageUrl) {
      return undefined;
    }

    imageCheckRef.current.url = imageUrl;

    const testImage = new window.Image();
    testImage.crossOrigin = 'anonymous';
    testImage.onerror = () => {
      console.warn(
        `BattleShipSprite: Failed to load image for type="${type}" state="${state}". Check this URL in the browser: ${imageUrl}`,
      );
      if (processedImageUrl !== imageUrl) {
        setProcessedImageUrl(imageUrl);
      }
    };
    testImage.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = testImage.naturalWidth;
        canvas.height = testImage.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          if (processedImageUrl !== imageUrl) {
            setProcessedImageUrl(imageUrl);
          }
          return;
        }

        context.drawImage(testImage, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        for (let offset = 0; offset < data.length; offset += 4) {
          const red = data[offset];
          const green = data[offset + 1];
          const blue = data[offset + 2];
          const alpha = data[offset + 3];
          const brightness = red + green + blue;

          if (alpha === 0) {
            continue;
          }

          if (brightness < 42) {
            data[offset + 3] = 0;
          } else if (brightness < 72) {
            data[offset + 3] = Math.round(alpha * 0.25);
          }
        }

        context.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        transparentSpriteCache.set(imageUrl, dataUrl);
        setProcessedImageUrl((currentUrl) => (currentUrl === dataUrl ? currentUrl : dataUrl));
      } catch (error) {
        console.warn(
          `BattleShipSprite: Transparency preprocessing failed for type="${type}" state="${state}". Falling back to original image.`,
          error,
        );
        if (processedImageUrl !== imageUrl) {
          setProcessedImageUrl(imageUrl);
        }
      }
    };
    testImage.src = imageUrl;

    return () => {
      testImage.onerror = null;
      testImage.onload = null;
    };
  }, [
    elementStyle.backgroundImage,
    normalizedType,
    processedImageUrl,
    spriteInfo?.url,
    state,
    type,
  ]);

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
        src={processedImageUrl || spriteInfo.url}
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
        style={{
          ...elementStyle,
          backgroundImage: `url(${processedImageUrl || spriteInfo.url})`,
        }}
        {...otherProps}
      />
    </>
  );
};

export default BattleShipSprite;
