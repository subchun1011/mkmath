import React, { useMemo, useRef, useState } from 'react';
import { useCoinStore } from './store/useCoinStore.js';
import './SelectionScreen.css';

const LEVELS = [1, 2, 3, 4, 5];

function getScreenCopy(view, mode) {
  if (view === 'battle-subcategory') {
    return {
      eyebrow: 'MATH ADVENTURE',
      title: '어떤 계산을 해볼까?',
      description: '지금은 전투형 수학 학습을 즐길 수 있어요.',
    };
  }

  if (view === 'crossword-category') {
    return {
      eyebrow: 'CROSSWORD PUZZLE',
      title: '가로세로 퍼즐 주제를 골라보자!',
      description: '수학 퍼즐부터 먼저 열어두었어요.',
    };
  }

  if (view === 'level' && mode === 'crossword') {
    return {
      eyebrow: 'CROSSWORD LEVEL',
      title: '퍼즐 난이도를 골라줘!',
      description: '유치원부터 초등 저학년까지 맞춘 수학 퍼즐이 준비돼 있어요.',
    };
  }

  if (view === 'level') {
    return {
      eyebrow: 'BATTLE LEVEL',
      title: '도전할 레벨을 선택해줘!',
      description: '레벨이 올라갈수록 숫자 범위가 조금씩 넓어져요.',
    };
  }

  return {
    eyebrow: 'KIDS LEARNING LAND',
    title: '오늘은 어떤 놀이를 해볼까?',
    description: '수학 모험도 좋고, 숫자 가로세로 퍼즐도 좋아!',
  };
}

export default function SelectionScreen({ onStartGame }) {
  const coins = useCoinStore((state) => state.coins);
  const lastPressRef = useRef({ key: '', at: 0 });
  const [view, setView] = useState('main');
  const [config, setConfig] = useState({
    experience: '',
    category: '',
    subCategory: '',
    level: 1,
  });

  const copy = useMemo(
    () => getScreenCopy(view, config.experience),
    [view, config.experience],
  );

  const handleBack = () => {
    if (view === 'level') {
      if (config.experience === 'crossword') {
        setView('crossword-category');
      } else {
        setView('battle-subcategory');
      }
      return;
    }

    if (view === 'battle-subcategory' || view === 'crossword-category') {
      setView('main');
    }
  };

  const startBattleFlow = () => {
    setConfig({
      experience: 'battle',
      category: 'math',
      subCategory: '',
      level: 1,
    });
    setView('battle-subcategory');
  };

  const startCrosswordFlow = () => {
    setConfig({
      experience: 'crossword',
      category: '',
      subCategory: '',
      level: 1,
    });
    setView('crossword-category');
  };

  const selectBattleSubcategory = (subCategory) => {
    setConfig((prev) => ({
      ...prev,
      category: 'math',
      subCategory,
    }));
    setView('level');
  };

  const selectCrosswordCategory = (category) => {
    if (category !== 'math') {
      return;
    }

    setConfig((prev) => ({
      ...prev,
      category,
      subCategory: 'crossword',
    }));
    setView('level');
  };

  const selectLevel = (level) => {
    onStartGame({
      ...config,
      level,
    });
  };

  const bindPress = (key, action) => {
    const runAction = () => {
      const now = Date.now();

      if (lastPressRef.current.key === key && now - lastPressRef.current.at < 350) {
        return;
      }

      lastPressRef.current = { key, at: now };
      action();
    };

    return {
      onClick: runAction,
      onPointerDown: runAction,
    };
  };

  return (
    <div className="selection-screen">
      <header className="selection-screen__header">
        <button
          type="button"
          className="selection-screen__back"
          onClick={handleBack}
          disabled={view === 'main'}
        >
          Back
        </button>
        <div className="selection-screen__header-copy">
          <div className="selection-screen__eyebrow">{copy.eyebrow}</div>
          <div className="selection-screen__title">{copy.title}</div>
        </div>
        <div className="selection-screen__coin">{coins} COIN</div>
      </header>

      <div className="selection-screen__content">
        <section className="selection-screen__card">
          <div className="selection-screen__hero">
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>

          {view === 'main' && (
            <div className="selection-screen__choices selection-screen__choices--main">
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--math"
                {...bindPress('main-math', startBattleFlow)}
              >
                <strong>수학</strong>
                <span>전투형 문제 풀이로 차근차근 익혀봐!</span>
              </button>
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--crossword"
                {...bindPress('main-crossword', startCrosswordFlow)}
              >
                <strong>가로세로 퍼즐</strong>
                <span>귀여운 숫자 퍼즐을 하나씩 채워보자!</span>
              </button>
            </div>
          )}

          {view === 'battle-subcategory' && (
            <div className="selection-screen__choices selection-screen__choices--sub">
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--addition"
                {...bindPress('battle-addition', () => selectBattleSubcategory('addition'))}
              >
                <strong>더하기</strong>
                <span>기본 계산 감각을 재미있게 키워요.</span>
              </button>
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--subtraction"
                {...bindPress('battle-subtraction', () => selectBattleSubcategory('subtraction'))}
              >
                <strong>빼기</strong>
                <span>수 감각을 또렷하게 만드는 연습이에요.</span>
              </button>
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--multiplication"
                {...bindPress('battle-multiplication', () => selectBattleSubcategory('multiplication'))}
              >
                <strong>곱하기</strong>
                <span>조금 더 빠르게 계산하는 힘을 길러요.</span>
              </button>
            </div>
          )}

          {view === 'crossword-category' && (
            <div className="selection-screen__choices selection-screen__choices--sub">
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--math-puzzle"
                {...bindPress('crossword-math', () => selectCrosswordCategory('math'))}
              >
                <strong>수학</strong>
                <span>현재 우선 개발 중인 숫자 가로세로 퍼즐이에요.</span>
              </button>
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--idiom selection-screen__choice--disabled"
                onClick={() => selectCrosswordCategory('idiom')}
              >
                <strong>속담</strong>
                <span>짧은 문장 퍼즐로 준비 중이에요.</span>
                <em className="selection-screen__soon">준비 중</em>
              </button>
              <button
                type="button"
                className="selection-screen__choice selection-screen__choice--saja selection-screen__choice--disabled"
                onClick={() => selectCrosswordCategory('saja')}
              >
                <strong>사자성어</strong>
                <span>한자 퍼즐 카테고리는 곧 열릴 거예요.</span>
                <em className="selection-screen__soon">준비 중</em>
              </button>
            </div>
          )}

          {view === 'level' && (
            <div className="selection-screen__choices selection-screen__choices--level">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className="selection-screen__choice selection-screen__choice--level"
                  {...bindPress(`level-${config.experience}-${level}`, () => selectLevel(level))}
                >
                  <strong>LEVEL {level}</strong>
                  <span>
                    {config.experience === 'crossword'
                      ? '숫자 퍼즐 난이도를 골라보자.'
                      : '전투 수학 난이도를 골라보자.'}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="selection-screen__footer">
            상단 Back 버튼과 코인은 고정되고, 아래 카드 내용만 바뀌도록 구성했어요.
          </div>
        </section>
      </div>
    </div>
  );
}
