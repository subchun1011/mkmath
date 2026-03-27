import React, { useState } from 'react';
import './StageMap.css';
import StageGameScreen from './StageGameScreen.jsx';

const stages = [
  { id: 1, x: 100, y: 400, label: '1-1', unlocked: true, category: 'math' },
  { id: 2, x: 300, y: 350, label: '1-2', unlocked: true, category: 'math' },
  { id: 3, x: 450, y: 200, label: '1-3', unlocked: false, category: 'math' },
  { id: 4, x: 700, y: 250, label: 'BOSS', unlocked: false, category: 'math' },
];

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
      // 맵에서 선택한 스테이지를 저장하면 4분할 게임 화면으로 전환된다.
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
