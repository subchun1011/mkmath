const GRID_SIZE = 10;
const TOTAL_PROGRESS_CELLS = 100;
const PREFILLED_RATIO = 0.2;
const equationPoolCache = new Map();

const PATTERN_DEFINITIONS = {
  'double-op-double': {
    length: 8,
    digitIndices: [0, 1, 3, 4, 6, 7],
  },
  'double-op-single': {
    length: 7,
    digitIndices: [0, 1, 3, 5, 6],
  },
};

const PLACEMENTS = [
  { id: 'across-1', row: 1, col: 1, direction: 'across', pattern: 'double-op-double' },
  { id: 'across-2', row: 4, col: 1, direction: 'across', pattern: 'double-op-single' },
  { id: 'across-3', row: 7, col: 2, direction: 'across', pattern: 'double-op-single' },
  { id: 'down-1', row: 1, col: 2, direction: 'down', pattern: 'double-op-single' },
  { id: 'down-3', row: 1, col: 7, direction: 'down', pattern: 'double-op-single' },
].map((placement) => ({
  ...placement,
  length: PATTERN_DEFINITIONS[placement.pattern].length,
}));

const FALLBACK_BLUEPRINTS = [
  {
    placementId: 'across-1',
    equation: { left: 21, right: 10, result: 11, operator: '-' },
    blankIndex: 3,
  },
  {
    placementId: 'across-2',
    equation: { left: 28, right: 9, result: 37, operator: '+' },
    blankIndex: 5,
  },
  {
    placementId: 'across-3',
    equation: { left: 29, right: 7, result: 22, operator: '-' },
    blankIndex: 1,
  },
  {
    placementId: 'down-1',
    equation: { left: 14, right: 8, result: 22, operator: '+' },
    blankIndex: 1,
  },
  {
    placementId: 'down-3',
    equation: { left: 15, right: 7, result: 22, operator: '+' },
    blankIndex: 5,
  },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getLevelLimits(level) {
  const safeLevel = Math.min(5, Math.max(1, Number(level) || 1));

  switch (safeLevel) {
    case 1:
      return { maxDouble: 19 };
    case 2:
      return { maxDouble: 29 };
    case 3:
      return { maxDouble: 39 };
    case 4:
      return { maxDouble: 59 };
    case 5:
    default:
      return { maxDouble: 89 };
  }
}

function createWallCell(row, col) {
  return {
    id: `cell-${row}-${col}`,
    row,
    col,
    kind: 'wall',
    text: '',
    solutionText: '',
    clueIds: [],
    solved: false,
  };
}

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => createWallCell(row, col)),
  );
}

function buildChoicePool(answerDigit) {
  return shuffle(
    Array.from({ length: 10 }, (_, value) => ({
      id: `choice-${answerDigit}-${value}`,
      value,
      isCorrect: value === answerDigit,
    })),
  );
}

function getPlaceLabel(digitsFromRight) {
  if (digitsFromRight === 0) {
    return '일의 자리';
  }

  if (digitsFromRight === 1) {
    return '십의 자리';
  }

  return '백의 자리';
}

function buildHintFromEquation(equation, blankMeta) {
  const { left, right, result, operator } = equation;
  const placeLabel = getPlaceLabel(blankMeta.digitsFromRight);

  if (blankMeta.part === 'result') {
    return {
      top: left,
      bottom: right,
      operator,
      result,
      placeLabel,
      summary: `${left} ${operator} ${right}`,
      guide: `${placeLabel}를 맞추려면 계산 결과를 세로로 살펴보자!`,
    };
  }

  if (operator === '+') {
    const knownValue = blankMeta.part === 'left' ? right : left;
    const unknownValue = blankMeta.part === 'left' ? left : right;

    return {
      top: result,
      bottom: knownValue,
      operator: '-',
      result: unknownValue,
      placeLabel,
      summary: `${result} - ${knownValue}`,
      guide: `${placeLabel}를 맞추려면 전체에서 알려진 수를 빼보자!`,
    };
  }

  if (blankMeta.part === 'left') {
    return {
      top: result,
      bottom: right,
      operator: '+',
      result: left,
      placeLabel,
      summary: `${result} + ${right}`,
      guide: `${placeLabel}를 찾으려면 결과에 뺀 수를 다시 더해봐!`,
    };
  }

  return {
    top: left,
    bottom: result,
    operator: '-',
    result: right,
    placeLabel,
    summary: `${left} - ${result}`,
    guide: `${placeLabel}를 찾으려면 원래 수에서 결과를 빼보자!`,
  };
}

function evaluateEquation(equation) {
  if (equation.operator === '+') {
    return equation.left + equation.right;
  }

  if (equation.operator === '-') {
    return equation.left - equation.right;
  }

  return Number.NaN;
}

function verifyEquation(equation) {
  const computed = evaluateEquation(equation);

  return Number.isFinite(computed) && computed === equation.result;
}

function createEquationRecord(equation) {
  if (!verifyEquation(equation)) {
    return null;
  }

  const leftText = String(equation.left);
  const rightText = String(equation.right);
  const resultText = String(equation.result);
  const fullText = `${leftText}${equation.operator}${rightText}=${resultText}`;
  const sequence = fullText.split('');
  const digitMetas = [];
  let cursor = 0;

  [leftText, rightText, resultText].forEach((partText, partIndex) => {
    const partName = partIndex === 0 ? 'left' : partIndex === 1 ? 'right' : 'result';

    if (partIndex > 0) {
      cursor += 1;
    }

    partText.split('').forEach((char, index) => {
      digitMetas.push({
        index: cursor + index,
        part: partName,
        char,
        digitsFromRight: partText.length - index - 1,
      });
    });

    cursor += partText.length;
  });

  return {
    equation,
    fullText,
    sequence,
    digitMetas,
  };
}

function addEquation(records, equation, expectedLength, seenTexts) {
  const record = createEquationRecord(equation);

  if (!record || record.sequence.length !== expectedLength || seenTexts.has(record.fullText)) {
    return;
  }

  seenTexts.add(record.fullText);
  records.push(record);
}

function buildEquationPools(level) {
  if (equationPoolCache.has(level)) {
    return equationPoolCache.get(level);
  }

  const limits = getLevelLimits(level);
  const { maxDouble } = limits;
  const pools = new Map();

  Object.keys(PATTERN_DEFINITIONS).forEach((patternId) => {
    pools.set(patternId, []);
  });

  const seenByPattern = new Map(
    Object.keys(PATTERN_DEFINITIONS).map((patternId) => [patternId, new Set()]),
  );

  for (let left = 10; left <= maxDouble; left += 1) {
    for (let right = 10; right <= maxDouble; right += 1) {
      addEquation(
        pools.get('double-op-double'),
        { left, right, result: left + right, operator: '+' },
        PATTERN_DEFINITIONS['double-op-double'].length,
        seenByPattern.get('double-op-double'),
      );
    }
  }

  for (let left = 10; left <= maxDouble; left += 1) {
    for (let right = 10; right < left; right += 1) {
      addEquation(
        pools.get('double-op-double'),
        { left, right, result: left - right, operator: '-' },
        PATTERN_DEFINITIONS['double-op-double'].length,
        seenByPattern.get('double-op-double'),
      );
    }
  }

  for (let left = 10; left <= maxDouble; left += 1) {
    for (let right = 1; right <= 9; right += 1) {
      addEquation(
        pools.get('double-op-single'),
        { left, right, result: left + right, operator: '+' },
        PATTERN_DEFINITIONS['double-op-single'].length,
        seenByPattern.get('double-op-single'),
      );

      addEquation(
        pools.get('double-op-single'),
        { left, right, result: left - right, operator: '-' },
        PATTERN_DEFINITIONS['double-op-single'].length,
        seenByPattern.get('double-op-single'),
      );
    }
  }

  const shuffledPools = new Map(
    [...pools.entries()].map(([patternId, records]) => [patternId, shuffle(records)]),
  );

  equationPoolCache.set(level, shuffledPools);
  return shuffledPools;
}

function getPlacementCoordinates(placement) {
  return Array.from({ length: placement.length }, (_, index) => ({
    index,
    row: placement.row + (placement.direction === 'down' ? index : 0),
    col: placement.col + (placement.direction === 'across' ? index : 0),
  }));
}

function getFixedChars(grid, placement) {
  const fixedChars = new Map();

  getPlacementCoordinates(placement).forEach(({ index, row, col }) => {
    const cell = grid[row][col];

    if (cell.kind !== 'wall') {
      fixedChars.set(index, cell.solutionText);
    }
  });

  return fixedChars;
}

function getMatchingCandidates(records, fixedChars, usedExpressions) {
  return records.filter((record) => {
    if (usedExpressions.has(record.fullText)) {
      return false;
    }

    for (const [index, char] of fixedChars.entries()) {
      if (record.sequence[index] !== char) {
        return false;
      }
    }

    return true;
  });
}

function pickBlankMeta(record, fixedChars) {
  const candidates = shuffle(
    record.digitMetas.filter((digitMeta) => !fixedChars.has(digitMeta.index)),
  );

  return candidates[0] || null;
}

function placeRecordOnGrid(grid, placement, record, blankMeta) {
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell, clueIds: [...cell.clueIds] })));
  let blankCell = null;

  getPlacementCoordinates(placement).forEach(({ index, row, col }) => {
    const currentCell = nextGrid[row][col];
    const char = record.sequence[index];
    const isBlank = blankMeta.index === index;

    if (currentCell.kind === 'wall') {
      nextGrid[row][col] = {
        ...currentCell,
        kind: isBlank ? 'blank' : 'token',
        text: isBlank ? '' : char,
        solutionText: char,
        clueIds: [placement.id],
        solved: !isBlank,
      };
    } else {
      nextGrid[row][col] = {
        ...currentCell,
        clueIds: [...currentCell.clueIds, placement.id],
      };
    }

    if (isBlank) {
      blankCell = { row, col };
      nextGrid[row][col] = {
        ...nextGrid[row][col],
        kind: 'blank',
        text: '',
        solutionText: char,
        solved: false,
      };
    }
  });

  return { nextGrid, blankCell };
}

function createClue(placement, record, blankMeta, blankCell) {
  const promptSequence = [...record.sequence];
  promptSequence[blankMeta.index] = '□';

  return {
    ...placement,
    answerDigit: Number(blankMeta.char),
    blankCell,
    choices: buildChoicePool(Number(blankMeta.char)),
    hint: buildHintFromEquation(record.equation, blankMeta),
    prompt: promptSequence.join(''),
    fullText: record.fullText,
    solved: false,
    prefilled: false,
  };
}

function markPrefilledClues(grid, clues) {
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell, clueIds: [...cell.clueIds] })));
  const prefilledCount = Math.max(1, Math.round(clues.length * PREFILLED_RATIO));
  const prefilledIds = new Set(
    shuffle(clues)
      .slice(0, prefilledCount)
      .map((clue) => clue.id),
  );

  const nextClues = clues.map((clue) => {
    if (!prefilledIds.has(clue.id)) {
      return clue;
    }

    const { row, col } = clue.blankCell;

    nextGrid[row][col] = {
      ...nextGrid[row][col],
      kind: 'prefilled',
      text: String(clue.answerDigit),
      solutionText: String(clue.answerDigit),
      solved: true,
    };

    return {
      ...clue,
      solved: true,
      prefilled: true,
    };
  });

  return { nextGrid, nextClues };
}

function solvePlacements(grid, remainingPlacements, pools, usedExpressions, clues) {
  if (remainingPlacements.length === 0) {
    return { grid, clues };
  }

  const placementOptions = remainingPlacements
    .map((placement) => {
      const fixedChars = getFixedChars(grid, placement);
      const matchingCandidates = getMatchingCandidates(
        pools.get(placement.pattern) || [],
        fixedChars,
        usedExpressions,
      );

      return {
        placement,
        fixedChars,
        matchingCandidates,
      };
    })
    .sort((left, right) => left.matchingCandidates.length - right.matchingCandidates.length);

  const nextPlacementOption = placementOptions[0];

  if (!nextPlacementOption || nextPlacementOption.matchingCandidates.length === 0) {
    return null;
  }

  const nextRemainingPlacements = remainingPlacements.filter(
    (placement) => placement.id !== nextPlacementOption.placement.id,
  );

  for (const record of nextPlacementOption.matchingCandidates) {
    const blankMeta = pickBlankMeta(record, nextPlacementOption.fixedChars);

    if (!blankMeta) {
      continue;
    }

    const { nextGrid, blankCell } = placeRecordOnGrid(
      grid,
      nextPlacementOption.placement,
      record,
      blankMeta,
    );
    const nextClue = createClue(nextPlacementOption.placement, record, blankMeta, blankCell);
    const solvedPuzzle = solvePlacements(
      nextGrid,
      nextRemainingPlacements,
      pools,
      new Set([...usedExpressions, record.fullText]),
      [...clues, nextClue],
    );

    if (solvedPuzzle) {
      return solvedPuzzle;
    }
  }

  return null;
}

function buildFallbackPuzzle(level) {
  const fallbackMap = new Map(
    FALLBACK_BLUEPRINTS.map((blueprint) => [blueprint.placementId, blueprint]),
  );
  let workingGrid = createEmptyGrid();
  const clues = [];

  for (const placement of PLACEMENTS) {
    const blueprint = fallbackMap.get(placement.id);

    if (!blueprint) {
      continue;
    }

    const record = createEquationRecord(blueprint.equation);
    const blankMeta = record?.digitMetas.find((digitMeta) => digitMeta.index === blueprint.blankIndex);

    if (!record || !blankMeta) {
      continue;
    }

    const { nextGrid, blankCell } = placeRecordOnGrid(workingGrid, placement, record, blankMeta);
    workingGrid = nextGrid;
    clues.push(createClue(placement, record, blankMeta, blankCell));
  }

  const { nextGrid, nextClues } = markPrefilledClues(workingGrid, clues);

  return {
    level,
    totalProgressCells: TOTAL_PROGRESS_CELLS,
    clues: nextClues,
    grid: nextGrid,
  };
}

function buildPuzzle(level) {
  const pools = buildEquationPools(level);
  const solvedPuzzle = solvePlacements(createEmptyGrid(), PLACEMENTS, pools, new Set(), []);

  if (!solvedPuzzle) {
    return null;
  }

  const { nextGrid, nextClues } = markPrefilledClues(solvedPuzzle.grid, solvedPuzzle.clues);

  return {
    level,
    totalProgressCells: TOTAL_PROGRESS_CELLS,
    clues: nextClues,
    grid: nextGrid,
  };
}

export function generateMathCrosswordGame(level = 1) {
  const safeLevel = Math.min(5, Math.max(1, Number(level) || 1));

  return buildPuzzle(safeLevel) || buildFallbackPuzzle(safeLevel);
}
