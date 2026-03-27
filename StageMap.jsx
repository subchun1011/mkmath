import React, { useState } from 'react';
import './StageMap.css';
import MainGameLayout from './MainGameLayout.jsx';
import partService from './PartService.js';

const stages = [
  { id: 1, x: 100, y: 400, label: '1-1', unlocked: true },
  { id: 2, x: 300, y: 350, label: '1-2', unlocked: true },
  { id: 3, x: 450, y: 200, label: '1-3', unlocked: false },
  { id: 4, x: 700, y: 250, label: 'BOSS', unlocked: false },
];

const { getHeadImage } = partService;

function StageGameScreen({ stage, onBack }) {
  const currentLevel = Math.min(stage.id, 10);
  const headImage = getHeadImage(currentLevel);

  return (
    <MainGameLayout
      timerContent={(
        <div className="game-timer-panel">
          <div className="game-timer-text">Stage {stage.label}</div>
          <div className="game-timer-track" aria-label="남은 시간">
            <div className="game-timer-fill" />
          </div>
        </div>
      )}
      actionContent={(
        <div className="robot-action-panel">
          <div className="robot-stage-badge">Level {currentLevel}</div>
          <div className="robot-preview">
            <div className="robot-head-slot">
              <img
                src={headImage}
                alt={`로봇 머리 레벨 ${currentLevel}`}
                className="robot-head-image"
              />
            </div>
            <div className="robot-body-slot">BODY</div>
          </div>
          <div className="robot-part-label">Head Lv.{currentLevel} 장착 완료</div>
        </div>
      )}
      questionContent={(
        <div className="game-question-panel">
          <div className="game-question-stage">{stage.label} 스테이지</div>
          <div className="game-question-text">문제를 풀면 로봇 파츠가 더 강해져요!</div>
        </div>
      )}
      inputContent={(
        <div className="game-input-panel">
          <div className="game-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <button key={number} type="button" className="game-key-button">
                {number}
              </button>
            ))}
          </div>
          <div className="game-input-actions">
            <button type="button" className="game-confirm-button">
              정답 확인
            </button>
            <button type="button" className="game-back-button" onClick={onBack}>
              맵으로 돌아가기
            </button>
          </div>
        </div>
      )}
    />
  );
}

export default function StageMap({ onSelectStage }) {
  const [currentPos, setCurrentPos] = useState(stages[0]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isEnteringStage, setIsEnteringStage] = useState(false);

  const handleStageClick = (stage) => {
    if (!stage.unlocked) {
      alert('아직 잠겨있어요!');
      return;
    }

    setCurrentPos(stage);
    setIsEnteringStage(true);

    setTimeout(() => {
      setSelectedStage(stage);
      setIsEnteringStage(false);

      if (onSelectStage) {
        onSelectStage(stage.id);
      }
    }, 500);
  };

  if (selectedStage) {
    return (
      <StageGameScreen
        stage={selectedStage}
        onBack={() => setSelectedStage(null)}
      />
    );
  }

  return (
    <div className="map-container">
      <svg className="map-svg" viewBox="0 0 800 500">
        <polyline
          points={stages.map((stage) => `${stage.x},${stage.y}`).join(' ')}
          fill="none"
          stroke="#ffce00"
          strokeWidth="4"
          strokeDasharray="10,10"
        />

        {stages.map((stage) => (
          <g
            key={stage.id}
            onClick={() => handleStageClick(stage)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={stage.x}
              cy={stage.y}
              r="25"
              className={`stage-node ${stage.unlocked ? 'unlocked' : 'locked'}`}
            />
            <text
              x={stage.x}
              y={stage.y + 5}
              textAnchor="middle"
              className="stage-label"
            >
              {stage.label}
            </text>
          </g>
        ))}

        <circle
          cx={currentPos.x}
          cy={currentPos.y}
          r="15"
          className="player-icon"
        />
      </svg>

      <div className="map-title">모험을 떠날 스테이지를 골라보자!</div>

      {isEnteringStage && (
        <div className="stage-enter-overlay">
          <div className="stage-enter-card">
            {currentPos.label} 스테이지로 이동 중...
          </div>
        </div>
      )}
    </div>
  );
}
