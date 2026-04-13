import { useSyncExternalStore } from 'react';

const DEFAULT_PROGRESS = {
  filledCells: 0,
  totalCells: 100,
  sessionId: 0,
};

let storeState = {
  coins: 0,
  crosswordProgress: DEFAULT_PROGRESS,
};

const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateStore(updater) {
  const nextState = typeof updater === 'function' ? updater(storeState) : updater;
  storeState = nextState;
  emitChange();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return storeState;
}

export function useCoinStore(selector = (state) => state) {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

export function addCoins(amount) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  updateStore((prev) => ({
    ...prev,
    coins: prev.coins + safeAmount,
  }));
}

export function subtractCoins(amount) {
  const safeAmount = Math.max(0, Number(amount) || 0);

  updateStore((prev) => {
    return {
      ...prev,
      coins: Math.max(0, prev.coins - safeAmount),
    };
  });
}

export function spendCoins(amount) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  let didSpend = false;

  updateStore((prev) => {
    if (prev.coins < safeAmount) {
      return prev;
    }

    didSpend = true;

    return {
      ...prev,
      coins: prev.coins - safeAmount,
    };
  });

  return didSpend;
}

export function startCrosswordSession(totalCells = 100) {
  updateStore((prev) => ({
    ...prev,
    crosswordProgress: {
      filledCells: 0,
      totalCells,
      sessionId: prev.crosswordProgress.sessionId + 1,
    },
  }));
}

export function setCrosswordProgress(filledCells, totalCells = 100) {
  const safeTotalCells = Math.max(1, Number(totalCells) || 100);
  const safeFilledCells = Math.max(0, Math.min(safeTotalCells, Number(filledCells) || 0));

  updateStore((prev) => ({
    ...prev,
    crosswordProgress: {
      ...prev.crosswordProgress,
      filledCells: safeFilledCells,
      totalCells: safeTotalCells,
    },
  }));
}

export function resetCrosswordProgress(totalCells = 100) {
  updateStore((prev) => ({
    ...prev,
    crosswordProgress: {
      ...DEFAULT_PROGRESS,
      totalCells,
      sessionId: prev.crosswordProgress.sessionId + 1,
    },
  }));
}
