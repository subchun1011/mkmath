import React, { useEffect, useMemo, useState } from 'react';
import {
  addCoins,
  setCrosswordProgress,
  startCrosswordSession,
  subtractCoins,
  useCoinStore,
} from '../store/useCoinStore.js';
import { generateMathCrosswordGame } from './generateMathCrosswordGame.js';
import './MathCrosswordScreen.css';

function initializeCrosswordSession(nextGame) {
  if (!nextGame) {
    return null;
  }

  const firstOpenClue = nextGame.clues.find((clue) => !clue.solved) || null;
  const filledCells = Math.round(
    (nextGame.clues.filter((clue) => clue.solved).length / Math.max(1, nextGame.clues.length)) *
      nextGame.totalProgressCells,
  );

  startCrosswordSession(nextGame.totalProgressCells);
  setCrosswordProgress(filledCells, nextGame.totalProgressCells);

  return firstOpenClue;
}

function buildUpdatedGrid(grid, clue) {
  const { row, col } = clue.blankCell;

  return grid.map((gridRow) =>
    gridRow.map((cell) => {
      if (cell.row !== row || cell.col !== col) {
        return cell;
      }

      return {
        ...cell,
        kind: 'solved',
        text: String(clue.answerDigit),
        solutionText: String(clue.answerDigit),
        solved: true,
      };
    }),
  );
}

function getNextUnsolvedClue(clues, currentClueId) {
  const currentIndex = clues.findIndex((clue) => clue.id === currentClueId);
  const orderedClues =
    currentIndex >= 0
      ? [...clues.slice(currentIndex + 1), ...clues.slice(0, currentIndex + 1)]
      : clues;

  return orderedClues.find((clue) => !clue.solved) || null;
}

function pickClueFromCell(cell, clues, selectedClueId) {
  if (!cell.clueIds || cell.clueIds.length === 0) {
    return null;
  }

  const relatedClues = cell.clueIds
    .map((clueId) => clues.find((clue) => clue.id === clueId))
    .filter(Boolean);
  const unsolvedClues = relatedClues.filter((clue) => !clue.solved);

  if (unsolvedClues.length === 0) {
    return null;
  }

  const blankOwner = unsolvedClues.find(
    (clue) => clue.blankCell.row === cell.row && clue.blankCell.col === cell.col,
  );

  if (blankOwner) {
    return blankOwner;
  }

  const currentlySelected = unsolvedClues.find((clue) => clue.id === selectedClueId);

  return currentlySelected || unsolvedClues[0];
}

function VerticalHint({ hint }) {
  if (!hint) {
    return null;
  }

  return (
    <div className="math-crossword__hint-stack">
      <div className="math-crossword__hint-number">{hint.top}</div>
      <div className="math-crossword__hint-operator-row">
        <span className="math-crossword__hint-operator">{hint.operator}</span>
        <span className="math-crossword__hint-number">{hint.bottom}</span>
      </div>
      <div className="math-crossword__hint-line" />
      <div className="math-crossword__hint-number math-crossword__hint-number--answer">
        {hint.resultDisplay}
      </div>
    </div>
  );
}

export default function MathCrosswordScreen({
  category = 'math',
  level = 1,
  onBack,
}) {
  const coins = useCoinStore((state) => state.coins);
  const crosswordProgress = useCoinStore((state) => state.crosswordProgress);
  const [gameState, setGameState] = useState(null);
  const [selectedClueId, setSelectedClueId] = useState(null);
  const [removedChoices, setRemovedChoices] = useState({});
  const [highlightedClueId, setHighlightedClueId] = useState(null);
  const [wrongClueId, setWrongClueId] = useState(null);
  const [isOptionLocked, setIsOptionLocked] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pressedAnswerCellId, setPressedAnswerCellId] = useState(null);
  const [, setNotice] = useState('');

  useEffect(() => {
    let isCancelled = false;
    setRemovedChoices({});
    setHighlightedClueId(null);
    setWrongClueId(null);
    setIsOptionLocked(false);
    setShowWrongFlash(false);
    setShowCompleteModal(false);
    setPressedAnswerCellId(null);
    setNotice('');
    setGameState(null);
    setSelectedClueId(null);

    const frameId = window.requestAnimationFrame(() => {
      const nextGame = generateMathCrosswordGame(level);

      if (isCancelled) {
        return;
      }

      if (!nextGame) {
        setNotice('퍼즐 길을 다시 그리고 있어. 잠깐만 기다려줘!');
        return;
      }

      const firstOpenClue = initializeCrosswordSession(nextGame);

      setGameState(nextGame);
      setSelectedClueId(firstOpenClue?.id || null);
    });

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [level, category]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    const solvedCount = gameState.clues.filter((clue) => clue.solved).length;
    const filledCells = Math.round(
      (solvedCount / Math.max(1, gameState.clues.length)) * gameState.totalProgressCells,
    );

    setCrosswordProgress(filledCells, gameState.totalProgressCells);

    if (solvedCount === gameState.clues.length && gameState.clues.length > 0) {
      setShowCompleteModal(true);
    }
  }, [gameState]);

  const selectedClue = useMemo(
    () => gameState?.clues.find((clue) => clue.id === selectedClueId) || null,
    [gameState, selectedClueId],
  );

  const visibleChoices = useMemo(() => {
    if (!selectedClue) {
      return [];
    }

    const removedValues = removedChoices[selectedClue.id] || [];

    return selectedClue.choices.filter((choice) => !removedValues.includes(choice.value));
  }, [removedChoices, selectedClue]);

  const progressPercent = Math.round(
    (crosswordProgress.filledCells / Math.max(1, crosswordProgress.totalCells)) * 100,
  );

  const handleSelectCell = (cell) => {
    if (showCompleteModal) {
      return;
    }

    if (!gameState) {
      return;
    }

    const nextClue = pickClueFromCell(cell, gameState.clues, selectedClueId);

    if (!nextClue) {
      return;
    }

    setSelectedClueId(nextClue.id);
    setWrongClueId(null);
    setNotice('');

    if (nextClue.blankCell.row === cell.row && nextClue.blankCell.col === cell.col) {
      setPressedAnswerCellId(cell.id);
      window.setTimeout(() => {
        setPressedAnswerCellId((currentId) => (currentId === cell.id ? null : currentId));
      }, 120);
    }
  };

  const handleCorrectChoice = (clue) => {
    const reward = Math.max(10, level * 10);
    const updatedClues = gameState.clues.map((item) =>
      item.id === clue.id
        ? {
            ...item,
            solved: true,
          }
        : item,
    );

    setIsOptionLocked(true);
    setHighlightedClueId(clue.id);
    setWrongClueId(null);
    setNotice(`정답! 레벨 보상으로 ${reward} 코인을 얻었어요.`);
    addCoins(reward);

    setGameState((prev) => ({
      ...prev,
      clues: prev.clues.map((item) =>
        item.id === clue.id
          ? {
              ...item,
              solved: true,
            }
          : item,
      ),
      grid: buildUpdatedGrid(prev.grid, clue),
    }));

    window.setTimeout(() => {
      const nextClue = getNextUnsolvedClue(updatedClues, clue.id);

      setIsOptionLocked(false);
      setHighlightedClueId(null);
      setRemovedChoices((prev) => ({
        ...prev,
        [clue.id]: [],
      }));
      setSelectedClueId(nextClue?.id || clue.id);
    }, 700);
  };

  const handleWrongChoice = (clue, value) => {
    subtractCoins(10);
    setWrongClueId(clue.id);
    setShowWrongFlash(true);
    setNotice('앗, 틀린 숫자는 사라졌어! 다시 골라보자.');
    setRemovedChoices((prev) => ({
      ...prev,
      [clue.id]: [...(prev[clue.id] || []), value],
    }));

    window.setTimeout(() => {
      setShowWrongFlash(false);
      setWrongClueId((currentId) => (currentId === clue.id ? null : currentId));
    }, 360);
  };

  const handleChoiceClick = (value) => {
    if (!selectedClue || selectedClue.solved || isOptionLocked || showCompleteModal) {
      return;
    }

    if (value === selectedClue.answerDigit) {
      handleCorrectChoice(selectedClue);
      return;
    }

    handleWrongChoice(selectedClue, value);
  };

  const handleReplay = () => {
    const nextGame = generateMathCrosswordGame(level);

    if (!nextGame) {
      setNotice('퍼즐을 다시 준비하는 중이야. 한 번 더 눌러줘!');
      return;
    }

    const firstOpenClue = initializeCrosswordSession(nextGame);

    setGameState(nextGame);
    setSelectedClueId(firstOpenClue?.id || null);
    setRemovedChoices({});
    setHighlightedClueId(null);
    setWrongClueId(null);
    setIsOptionLocked(false);
    setShowWrongFlash(false);
    setShowCompleteModal(false);
    setPressedAnswerCellId(null);
    setNotice('');
  };

  return (
    <div className={`math-crossword ${showWrongFlash ? 'math-crossword--wrong-flash' : ''}`}>
      <header className="math-crossword__header">
        <button type="button" className="math-crossword__back" onClick={onBack}>
          Back
        </button>
        <div className="math-crossword__level-pill">LV.{level}</div>
        <div className="math-crossword__coin-pill">{coins} COIN</div>
      </header>

      <section className="math-crossword__progress-inline">
        <div className="math-crossword__progress-inline-copy">
          <span>
            {crosswordProgress.filledCells} / {crosswordProgress.totalCells}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="math-crossword__progress-inline-track">
          <div
            className="math-crossword__progress-inline-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      <main className="math-crossword__content">
        {!gameState ? (
          <section className="math-crossword__loading-card">
            <div className="math-crossword__loading-title">퍼즐 길을 만드는 중이야!</div>
            <div className="math-crossword__loading-sub">교차하는 숫자 미로를 준비하고 있어.</div>
          </section>
        ) : (
          <>
        <section className="math-crossword__board-panel">
          <div className="math-crossword__board-shell">
            <div className="math-crossword__grid">
              {gameState.grid.flat().map((cell) => {
                const isLineSelected = Boolean(selectedClue && cell.clueIds.includes(selectedClue.id));
                const isLineWrong = Boolean(wrongClueId && cell.clueIds.includes(wrongClueId));
                const isHighlighted = Boolean(highlightedClueId && cell.clueIds.includes(highlightedClueId));
                const isAnswerCell =
                  Boolean(selectedClue) &&
                  selectedClue.blankCell.row === cell.row &&
                  selectedClue.blankCell.col === cell.col;
                const isAnswerCellPressed = pressedAnswerCellId === cell.id;

                return (
                  <button
                    key={cell.id}
                    type="button"
                    className={[
                      'math-crossword__cell',
                      `math-crossword__cell--${cell.kind}`,
                      isLineSelected ? 'is-line-selected' : '',
                      isLineWrong ? 'is-line-wrong' : '',
                      isHighlighted ? 'is-line-correct' : '',
                      isAnswerCell ? 'is-answer-cell' : '',
                      isAnswerCellPressed ? 'is-answer-cell-pressed' : '',
                    ].join(' ').trim()}
                    onClick={() => handleSelectCell(cell)}
                    disabled={cell.kind === 'wall'}
                  >
                    {cell.text}
                    {isHighlighted && cell.kind !== 'wall' && <span className="math-crossword__sparkle" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="math-crossword__side-panel">
          <div className="math-crossword__hint-card">
            <VerticalHint hint={selectedClue?.hint} />
          </div>

          <div className="math-crossword__choices-card">
            <div className="math-crossword__choices">
              {visibleChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="math-crossword__choice"
                  onClick={() => handleChoiceClick(choice.value)}
                  disabled={!selectedClue || isOptionLocked || showCompleteModal}
                >
                  {choice.value}
                </button>
              ))}
            </div>
            {isOptionLocked && <div className="math-crossword__choices-lock" />}
          </div>
        </section>
          </>
        )}
      </main>

      {showCompleteModal && (
        <div className="math-crossword__overlay">
          <div className="math-crossword__modal">
            <h2>퍼즐 완성!</h2>
            <p>숫자 미로를 모두 풀었어. 다시 이어서 놀아볼까?</p>
            <div className="math-crossword__modal-actions">
              <button
                type="button"
                className="math-crossword__modal-primary"
                onClick={handleReplay}
              >
                다시하기
              </button>
              <button
                type="button"
                className="math-crossword__modal-secondary"
                onClick={onBack}
              >
                그만하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
