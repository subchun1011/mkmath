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
    type === 'effect'
  );
}

function isNearBlackBackgroundPixel(data, offset) {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const alpha = data[offset + 3];

  if (alpha === 0) {
    return true;
  }

  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const saturationGap = maxChannel - minChannel;
  const brightness = red + green + blue;

  return (
    maxChannel <= 34 ||
    (maxChannel <= 58 && brightness <= 120 && saturationGap <= 22) ||
    (maxChannel <= 74 && brightness <= 156 && saturationGap <= 14)
  );
}

function softenDarkEdgePixels(data) {
  for (let offset = 0; offset < data.length; offset += 4) {
    const alpha = data[offset + 3];

    if (alpha === 0) {
      continue;
    }

    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const maxChannel = Math.max(red, green, blue);
    const minChannel = Math.min(red, green, blue);
    const saturationGap = maxChannel - minChannel;
    const brightness = red + green + blue;

    if (maxChannel <= 62 && brightness <= 144 && saturationGap <= 20) {
      data[offset + 3] = Math.min(alpha, 36);
    } else if (maxChannel <= 82 && brightness <= 180 && saturationGap <= 18) {
      data[offset + 3] = Math.min(alpha, 96);
    }
  }
}

function removeNearBlackBackground(imageData) {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const pixelIndex = y * width + x;

    if (visited[pixelIndex]) {
      return;
    }

    const offset = pixelIndex * 4;

    if (!isNearBlackBackgroundPixel(data, offset)) {
      return;
    }

    visited[pixelIndex] = 1;
    queue.push(pixelIndex);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const pixelIndex = queue.shift();
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const offset = pixelIndex * 4;

    data[offset + 3] = 0;

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  softenDarkEdgePixels(data);

  return imageData;
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
      const mergedStyle = {
        imageRendering: 'pixelated',
        display: 'inline-block',
        opacity: 1,
        mixBlendMode: 'normal',
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

    let isCancelled = false;

    const testImage = new window.Image();
    testImage.crossOrigin = 'anonymous';
    testImage.onerror = () => {
      if (isCancelled) {
        return;
      }

      console.warn(
        `BattleShipSprite: Failed to load image for type="${type}" state="${state}". Check this URL in the browser: ${imageUrl}`,
      );
      if (processedImageUrl !== imageUrl) {
        setProcessedImageUrl(imageUrl);
      }
    };
    testImage.onload = () => {
      if (isCancelled) {
        return;
      }

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
        const processedImageData = removeNearBlackBackground(imageData);
        context.putImageData(processedImageData, 0, 0);
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
      isCancelled = true;
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
  const shouldProcessTransparency = shouldMakeBlackTransparent(normalizedType, type);

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
