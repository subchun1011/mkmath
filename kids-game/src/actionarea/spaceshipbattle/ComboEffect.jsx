import React, { useEffect, useState } from 'react';
import './ComboEffect.css';

const ComboEffect = ({ combo }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (combo > 0) {
      setVisible(true);
      // 0.8초 뒤에 사라짐
      const timer = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  if (!visible || combo === 0) return null;

  return (
    <div className="combo-effect-container">
      <div className="combo-effect-text">{combo} COMBO!</div>
      <div className="combo-effect-sub">POWER UP!</div>
    </div>
  );
};

export default ComboEffect;