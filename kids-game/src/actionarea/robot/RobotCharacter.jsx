import React from 'react';

const RobotCharacter = ({ type, parts, isHurt }) => {
  // parts: { head: 1, body: 1, arms: 1, legs: 1, wings: 0 }
  
  const getImagePath = (part, lv) => `/assets/robot/${part}_c_v${lv}.png`;

  return (
    <div className={`robot-body-container ${isHurt ? 'hurt-shake' : ''}`}>
      {/* 날개는 레벨이 1 이상일 때만 노출 (진화 표현) */}
      {parts.wings > 0 && (
        <img src={getImagePath('wings', parts.wings)} className="part wings" alt="wings" />
      )}
      
      <img src={getImagePath('body', parts.body)} className="part body" alt="body" />
      <img src={getImagePath('legs', parts.legs)} className="part legs" alt="legs" />
      <img src={getImagePath('head', parts.head)} className="part head" alt="head" />
      <img src={getImagePath('arms', parts.arms)} className="part arms" alt="arms" />
      
      {/* 오라 효과 (최종 진화 시) */}
      {parts.head >= 3 && <div className="evolution-aura"></div>}
    </div>
  );
};

export default RobotCharacter;