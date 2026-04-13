const GRID_SIZE = 10;
const TOTAL_PROGRESS_CELLS = 100;
const PREFILLED_RATIO = 0.2;
const equationPoolCache = new Map();

const PATTERN_DEFINITIONS = {
  'two-add-two': { length: 8, operator: '+' },
  'two-sub-two': { length: 8, operator: '-' },
  'three-add-two': { length: 10, operator: '+' },
  'two-add-three': { length: 10, operator: '+' },
  'three-sub-two': { length: 10, operator: '-' },
  'two-mul-two': { length: 9, operator: '×' },
  'two-div-two': { length: 7, operator: '÷' },
};

const LEVEL_LIMITS = {
  1: { twoDigitMin: 10, twoDigitMax: 49, threeDigitMin: 100, threeDigitMax: 199, multiplyMax: 14, divisionMax: 12 },
  2: { twoDigitMin: 10, twoDigitMax: 99, threeDigitMin: 100, threeDigitMax: 299, multiplyMax: 16, divisionMax: 12 },
  3: { twoDigitMin: 10, twoDigitMax: 99, threeDigitMin: 100, threeDigitMax: 399, multiplyMax: 18, divisionMax: 14 },
  4: { twoDigitMin: 10, twoDigitMax: 99, threeDigitMin: 100, threeDigitMax: 699, multiplyMax: 19, divisionMax: 15 },
  5: { twoDigitMin: 10, twoDigitMax: 99, threeDigitMin: 100, threeDigitMax: 999, multiplyMax: 24, divisionMax: 18 },
};

const FALLBACK_BLUEPRINTS = {
  1: [
    { placementId: 'across-1', equation: { left: 24, right: 15, result: 39, operator: '+' }, blankIndex: 6 },
    { placementId: 'across-2', equation: { left: 31, right: 12, result: 43, operator: '+' }, blankIndex: 3 },
    { placementId: 'across-3', equation: { left: 22, right: 16, result: 38, operator: '+' }, blankIndex: 7 },
    { placementId: 'down-1', equation: { left: 14, right: 12, result: 26, operator: '+' }, blankIndex: 3 },
    { placementId: 'down-2', equation: { left: 15, right: 24, result: 39, operator: '+' }, blankIndex: 6 },
  ],
  2: [
    { placementId: 'across-1', equation: { left: 45, right: 12, result: 33, operator: '-' }, blankIndex: 6 },
    { placementId: 'across-2', equation: { left: 23, right: 18, result: 41, operator: '+' }, blankIndex: 3 },
    { placementId: 'across-3', equation: { left: 54, right: 11, result: 43, operator: '-' }, blankIndex: 7 },
    { placementId: 'down-1', equation: { left: 16, right: 12, result: 28, operator: '+' }, blankIndex: 3 },
    { placementId: 'down-2', equation: { left: 66, right: 33, result: 33, operator: '-' }, blankIndex: 4 },
  ],
  3: [
    { placementId: 'across-1', equation: { left: 125, right: 34, result: 159, operator: '+' }, blankIndex: 7 },
    { placementId: 'across-2', equation: { left: 342, right: 21, result: 321, operator: '-' }, blankIndex: 4 },
    { placementId: 'across-3', equation: { left: 140, right: 25, result: 165, operator: '+' }, blankIndex: 9 },
    { placementId: 'down-1', equation: { left: 214, right: 31, result: 245, operator: '+' }, blankIndex: 7 },
    { placementId: 'down-2', equation: { left: 387, right: 42, result: 345, operator: '-' }, blankIndex: 9 },
  ],
  4: [
    { placementId: 'across-1', equation: { left: 100, right: 10, result: 110, operator: '+' }, blankIndex: 7 },
    { placementId: 'across-2', equation: { left: 11, right: 11, result: 121, operator: '×' }, blankIndex: 6 },
    { placementId: 'across-3', equation: { left: 110, right: 10, result: 100, operator: '-' }, blankIndex: 8 },
    { placementId: 'down-1', equation: { left: 10, right: 11, result: 110, operator: '×' }, blankIndex: 7 },
    { placementId: 'down-2', equation: { left: 110, right: 10, result: 120, operator: '+' }, blankIndex: 7 },
  ],
  5: [
    { placementId: 'across-1', equation: { left: 120, right: 10, result: 130, operator: '+' }, blankIndex: 7 },
    { placementId: 'across-2', equation: { left: 11, right: 11, result: 121, operator: '×' }, blankIndex: 6 },
    { placementId: 'across-3', equation: { left: 120, right: 10, result: 110, operator: '-' }, blankIndex: 8 },
    { placementId: 'down-1', equation: { left: 20, right: 10, result: 2, operator: '÷' }, blankIndex: 4 },
    { placementId: 'down-2', equation: { left: 110, right: 10, result: 120, operator: '+' }, blankIndex: 7 },
  ],
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getLevelLimits(level) {
  return LEVEL_LIMITS[level] || LEVEL_LIMITS[5];
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

  return {
    top: blankMeta.part === 'left' ? '?' : String(left),
    bottom: blankMeta.part === 'right' ? '?' : String(right),
    operator,
    resultDisplay: blankMeta.part === 'result' ? '?' : String(result),
    placeLabel: getPlaceLabel(blankMeta.digitsFromRight),
  };
}

function evaluateEquation(equation) {
  if (equation.operator === '+') {
    return equation.left + equation.right;
  }

  if (equation.operator === '-') {
    return equation.left - equation.right;
  }

  if (equation.operator === '×') {
    return equation.left * equation.right;
  }

  if (equation.operator === '÷') {
    if (equation.right === 0 || equation.left % equation.right !== 0) {
      return Number.NaN;
    }

    return equation.left / equation.right;
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

function populatePatternRecords(patternId, limits) {
  const pattern = PATTERN_DEFINITIONS[patternId];
  const records = [];
  const seenTexts = new Set();
  const { twoDigitMin, twoDigitMax, threeDigitMin, threeDigitMax, multiplyMax, divisionMax } = limits;

  if (patternId === 'two-add-two') {
    for (let left = twoDigitMin; left <= twoDigitMax; left += 1) {
      for (let right = twoDigitMin; right <= twoDigitMax; right += 1) {
        const result = left + right;

        if (result >= 10 && result <= 99) {
          addEquation(records, { left, right, result, operator: '+' }, pattern.length, seenTexts);
        }
      }
    }
  }

  if (patternId === 'two-sub-two') {
    for (let left = twoDigitMin; left <= twoDigitMax; left += 1) {
      for (let right = twoDigitMin; right < left; right += 1) {
        const result = left - right;

        if (result >= 10 && result <= 99) {
          addEquation(records, { left, right, result, operator: '-' }, pattern.length, seenTexts);
        }
      }
    }
  }

  if (patternId === 'three-add-two') {
    for (let left = threeDigitMin; left <= threeDigitMax; left += 1) {
      for (let right = twoDigitMin; right <= twoDigitMax; right += 1) {
        const result = left + right;

        if (result >= 100 && result <= 999) {
          addEquation(records, { left, right, result, operator: '+' }, pattern.length, seenTexts);
        }
      }
    }
  }

  if (patternId === 'two-add-three') {
    for (let left = twoDigitMin; left <= twoDigitMax; left += 1) {
      for (let right = threeDigitMin; right <= threeDigitMax; right += 1) {
        const result = left + right;

        if (result >= 100 && result <= 999) {
          addEquation(records, { left, right, result, operator: '+' }, pattern.length, seenTexts);
        }
      }
    }
  }

  if (patternId === 'three-sub-two') {
    for (let left = threeDigitMin; left <= threeDigitMax; left += 1) {
      for (let right = twoDigitMin; right <= twoDigitMax; right += 1) {
        const result = left - right;

        if (result >= 100 && result <= 999) {
          addEquation(records, { left, right, result, operator: '-' }, pattern.length, seenTexts);
        }
      }
    }
  }

  if (patternId === 'two-mul-two') {
    for (let left = 10; left <= multiplyMax; left += 1) {
      for (let right = 10; right <= multiplyMax; right += 1) {
        const result = left * right;

        if (result >= 100 && result <= 999) {
          addEquation(records, { left, right, result, operator: '×' }, pattern.length, seenTexts);
        }
      }
    }
  }

  if (patternId === 'two-div-two') {
    for (let right = 10; right <= divisionMax; right += 1) {
      for (let result = 2; result <= 9; result += 1) {
        const left = right * result;

        if (left >= 10 && left <= 99) {
          addEquation(records, { left, right, result, operator: '÷' }, pattern.length, seenTexts);
        }
      }
    }
  }

  return shuffle(records);
}

function buildEquationPools(level, placements) {
  const limits = getLevelLimits(level);
  const pools = new Map();
  const uniquePatternIds = new Set(placements.flatMap((placement) => placement.patternIds));

  uniquePatternIds.forEach((patternId) => {
    const cacheKey = `${level}:${patternId}`;

    if (!equationPoolCache.has(cacheKey)) {
      equationPoolCache.set(cacheKey, populatePatternRecords(patternId, limits));
    }

    pools.set(patternId, equationPoolCache.get(cacheKey));
  });

  return pools;
}

function createPlacement({ id, row, col, direction, patternIds }) {
  return {
    id,
    row,
    col,
    direction,
    patternIds,
    length: PATTERN_DEFINITIONS[patternIds[0]].length,
  };
}

function buildLevelPlacements(level) {
  if (level === 1) {
    return [
      createPlacement({ id: 'across-1', row: 1, col: 0, direction: 'across', patternIds: ['two-add-two'] }),
      createPlacement({ id: 'across-2', row: 4, col: 0, direction: 'across', patternIds: ['two-add-two'] }),
      createPlacement({ id: 'across-3', row: 7, col: 0, direction: 'across', patternIds: ['two-add-two'] }),
      createPlacement({ id: 'down-1', row: 0, col: 1, direction: 'down', patternIds: ['two-add-two'] }),
      createPlacement({ id: 'down-2', row: 0, col: 4, direction: 'down', patternIds: ['two-add-two'] }),
    ];
  }

  if (level === 2) {
    const operators = shuffle(['two-add-two', 'two-sub-two', 'two-add-two', 'two-sub-two', 'two-add-two']);

    return [
      createPlacement({ id: 'across-1', row: 1, col: 0, direction: 'across', patternIds: [operators[0]] }),
      createPlacement({ id: 'across-2', row: 4, col: 0, direction: 'across', patternIds: [operators[1]] }),
      createPlacement({ id: 'across-3', row: 7, col: 0, direction: 'across', patternIds: [operators[2]] }),
      createPlacement({ id: 'down-1', row: 0, col: 1, direction: 'down', patternIds: [operators[3]] }),
      createPlacement({ id: 'down-2', row: 0, col: 4, direction: 'down', patternIds: [operators[4]] }),
    ];
  }

  if (level === 3) {
    const plusMinusPatterns = shuffle([
      ['three-add-two', 'two-add-three'],
      ['three-sub-two'],
      ['three-add-two', 'two-add-three'],
      ['three-sub-two'],
      ['three-add-two', 'two-add-three'],
    ]);

    return [
      createPlacement({ id: 'across-1', row: 1, col: 0, direction: 'across', patternIds: plusMinusPatterns[0] }),
      createPlacement({ id: 'across-2', row: 4, col: 0, direction: 'across', patternIds: plusMinusPatterns[1] }),
      createPlacement({ id: 'across-3', row: 7, col: 0, direction: 'across', patternIds: plusMinusPatterns[2] }),
      createPlacement({ id: 'down-1', row: 0, col: 1, direction: 'down', patternIds: plusMinusPatterns[3] }),
      createPlacement({ id: 'down-2', row: 0, col: 4, direction: 'down', patternIds: plusMinusPatterns[4] }),
    ];
  }

  if (level === 4) {
    const plusMinusPatterns = shuffle([
      ['three-add-two', 'two-add-three'],
      ['three-sub-two'],
      ['three-add-two', 'two-add-three'],
    ]);

    return [
      createPlacement({ id: 'across-1', row: 1, col: 0, direction: 'across', patternIds: plusMinusPatterns[0] }),
      createPlacement({ id: 'across-2', row: 4, col: 0, direction: 'across', patternIds: ['two-mul-two'] }),
      createPlacement({ id: 'across-3', row: 7, col: 0, direction: 'across', patternIds: plusMinusPatterns[1] }),
      createPlacement({ id: 'down-1', row: 0, col: 1, direction: 'down', patternIds: ['two-mul-two'] }),
      createPlacement({ id: 'down-2', row: 0, col: 4, direction: 'down', patternIds: plusMinusPatterns[2] }),
    ];
  }

  const plusMinusPatterns = shuffle([
    ['three-add-two', 'two-add-three'],
    ['three-sub-two'],
    ['three-add-two', 'two-add-three'],
  ]);

  return [
    createPlacement({ id: 'across-1', row: 1, col: 0, direction: 'across', patternIds: plusMinusPatterns[0] }),
    createPlacement({ id: 'across-2', row: 4, col: 0, direction: 'across', patternIds: ['two-mul-two'] }),
    createPlacement({ id: 'across-3', row: 7, col: 0, direction: 'across', patternIds: plusMinusPatterns[1] }),
    createPlacement({ id: 'down-1', row: 1, col: 1, direction: 'down', patternIds: ['two-div-two'] }),
    createPlacement({ id: 'down-2', row: 0, col: 4, direction: 'down', patternIds: plusMinusPatterns[2] }),
  ];
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

function getPlacementCandidates(placement, pools, fixedChars, usedExpressions) {
  return shuffle(
    placement.patternIds.flatMap((patternId) =>
      (pools.get(patternId) || []).filter((record) => {
        if (usedExpressions.has(record.fullText)) {
          return false;
        }

        for (const [index, char] of fixedChars.entries()) {
          if (record.sequence[index] !== char) {
            return false;
          }
        }

        return true;
      }),
    ),
  );
}

function verifySharedCells(grid, placement, record) {
  return getPlacementCoordinates(placement).every(({ index, row, col }) => {
    const cell = grid[row][col];

    if (cell.kind === 'wall') {
      return true;
    }

    return cell.solutionText === record.sequence[index];
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

function verifyCluePlacement(clue, record, blankMeta, blankCell) {
  if (!verifyEquation(record.equation) || !blankCell) {
    return false;
  }

  if (Number(blankMeta.char) !== clue.answerDigit) {
    return false;
  }

  return (
    clue.blankCell.row === blankCell.row &&
    clue.blankCell.col === blankCell.col &&
    record.sequence[blankMeta.index] === String(clue.answerDigit)
  );
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
      const matchingCandidates = getPlacementCandidates(placement, pools, fixedChars, usedExpressions);

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
    if (!verifyEquation(record.equation)) {
      continue;
    }

    if (!verifySharedCells(grid, nextPlacementOption.placement, record)) {
      continue;
    }

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

    if (!verifyCluePlacement(nextClue, record, blankMeta, blankCell)) {
      continue;
    }

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

function buildFallbackPuzzle(level, placements) {
  const fallbackMap = new Map(
    (FALLBACK_BLUEPRINTS[level] || FALLBACK_BLUEPRINTS[1]).map((blueprint) => [
      blueprint.placementId,
      blueprint,
    ]),
  );
  let workingGrid = createEmptyGrid();
  const clues = [];

  for (const placement of placements) {
    const blueprint = fallbackMap.get(placement.id);

    if (!blueprint) {
      continue;
    }

    const record = createEquationRecord(blueprint.equation);
    const blankMeta = record?.digitMetas.find((digitMeta) => digitMeta.index === blueprint.blankIndex);

    if (!record || !blankMeta || record.sequence.length !== placement.length) {
      continue;
    }

    if (!verifySharedCells(workingGrid, placement, record)) {
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
  const placements = buildLevelPlacements(level);
  const pools = buildEquationPools(level, placements);
  const solvedPuzzle = solvePlacements(createEmptyGrid(), placements, pools, new Set(), []);

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
  const placements = buildLevelPlacements(safeLevel);

  return buildPuzzle(safeLevel) || buildFallbackPuzzle(safeLevel, placements);
}
