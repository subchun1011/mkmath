const MAX_PART_LEVEL = 10;
const WINGS_UNLOCK_LEVEL = 5;
const CORE_PART_NAMES = ['head', 'body', 'arms', 'legs'];

export const robotState = {
  experience: 0,
  head: {
    level: 1,
    image: '',
  },
  body: {
    level: 1,
    image: '',
  },
  arms: {
    level: 1,
    image: '',
  },
  legs: {
    level: 1,
    image: '',
  },
  wings: {
    owned: false,
    unlocked: false,
    image: '',
  },
  cannon: {
    owned: false,
    unlocked: false,
    image: '',
  },
  animation: {
    jump: false,
  },
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

export function getPartImage(partName, tier) {
  const safeTier = normalizeLevel(tier);
  return `/assets/robot/${partName}_v${safeTier}.png`;
}

export function getHeadImage(level) {
  return getPartImage('head', level);
}

export function createRobotState(overrides = {}) {
  return {
    experience: overrides.experience ?? robotState.experience,
    head: {
      ...robotState.head,
      image: getPartImage('head', robotState.head.level),
      ...overrides.head,
    },
    body: {
      ...robotState.body,
      image: getPartImage('body', robotState.body.level),
      ...overrides.body,
    },
    arms: {
      ...robotState.arms,
      image: getPartImage('arms', robotState.arms.level),
      ...overrides.arms,
    },
    legs: {
      ...robotState.legs,
      image: getPartImage('legs', robotState.legs.level),
      ...overrides.legs,
    },
    wings: {
      ...robotState.wings,
      ...overrides.wings,
    },
    cannon: {
      ...robotState.cannon,
      ...overrides.cannon,
    },
    animation: {
      ...robotState.animation,
      ...overrides.animation,
    },
  };
}

export function checkEvolution(currentLevel, currentRobotState = createRobotState()) {
  const safeLevel = normalizeLevel(currentLevel);
  const nextRobotState = createRobotState(currentRobotState);

  if (safeLevel >= WINGS_UNLOCK_LEVEL) {
    nextRobotState.wings.unlocked = true;
  }

  return nextRobotState;
}

export function upgradePart(parts = {}, currentLevel = 1) {
  const allowedLevel = normalizeLevel(currentLevel);
  const nextParts = checkEvolution(currentLevel, parts);
  const currentHead = parts.head || {
    level: 0,
    image: getHeadImage(1),
  };

  const nextHeadLevel = Math.min(currentHead.level + 1, allowedLevel);

  return {
    ...nextParts,
    head: {
      level: nextHeadLevel,
      image: getPartImage('head', nextHeadLevel || 1),
    },
  };
}

export function upgradeRobotPart(
  currentRobotState = createRobotState(),
  partName = 'head',
  currentLevel = 1,
) {
  const safeLevel = normalizeLevel(currentLevel);
  const nextRobotState = checkEvolution(currentLevel, createRobotState(currentRobotState));
  const safePartName = CORE_PART_NAMES.includes(partName) ? partName : 'head';
  const currentPart = nextRobotState[safePartName] || { level: 1, image: getPartImage(safePartName, 1) };
  const nextPartLevel = Math.min((currentPart.level || 1) + 1, safeLevel);

  nextRobotState[safePartName] = {
    ...currentPart,
    level: nextPartLevel,
    image: getPartImage(safePartName, nextPartLevel),
  };

  return nextRobotState;
}

export function getUpgradeablePartName(progressIndex = 0) {
  return CORE_PART_NAMES[Math.abs(progressIndex) % CORE_PART_NAMES.length];
}

export function addExperience(currentRobotState = createRobotState(), amount = 1) {
  return {
    ...createRobotState(currentRobotState),
    experience: Math.max(0, (currentRobotState.experience || 0) + amount),
  };
}

export function setJumpAnimation(currentRobotState = createRobotState(), isJumping) {
  return {
    ...createRobotState(currentRobotState),
    animation: {
      ...currentRobotState.animation,
      jump: Boolean(isJumping),
    },
  };
}
