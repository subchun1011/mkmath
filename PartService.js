const MAX_PART_LEVEL = 10;

const HEAD_IMAGES = {
  1: '/assets/robot/head/head-level-1.png',
  2: '/assets/robot/head/head-level-2.png',
  3: '/assets/robot/head/head-level-3.png',
  4: '/assets/robot/head/head-level-4.png',
  5: '/assets/robot/head/head-level-5.png',
  6: '/assets/robot/head/head-level-6.png',
  7: '/assets/robot/head/head-level-7.png',
  8: '/assets/robot/head/head-level-8.png',
  9: '/assets/robot/head/head-level-9.png',
  10: '/assets/robot/head/head-level-10.png',
};

function normalizeLevel(level) {
  const parsedLevel = Number(level);

  if (Number.isNaN(parsedLevel) || parsedLevel < 1) {
    return 1;
  }

  if (parsedLevel > MAX_PART_LEVEL) {
    return MAX_PART_LEVEL;
  }

  return Math.floor(parsedLevel);
}

function getHeadImage(level) {
  const safeLevel = normalizeLevel(level);
  return HEAD_IMAGES[safeLevel];
}

function upgradePart(parts = {}, currentLevel = 1) {
  const allowedLevel = normalizeLevel(currentLevel);
  const currentHead = parts.head || {
    level: 0,
    image: getHeadImage(1),
  };

  const nextHeadLevel = Math.min(currentHead.level + 1, allowedLevel);
  const upgradedHead = {
    level: nextHeadLevel,
    image: getHeadImage(nextHeadLevel || 1),
  };

  return {
    ...parts,
    head: upgradedHead,
  };
}

module.exports = {
  HEAD_IMAGES,
  getHeadImage,
  upgradePart,
};
