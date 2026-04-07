import React from 'react';
import './HealthBar.css';

const HealthBar = ({
  currentHP,
  maxHP,
  current,
  max,
  isPlayer,
  label,
}) => {
  const safeCurrentHP = Number.isFinite(currentHP) ? currentHP : Number(current);
  const safeMaxHP = Number.isFinite(maxHP) ? maxHP : Number(max);
  const normalizedMaxHP = safeMaxHP > 0 ? safeMaxHP : 100;
  const normalizedCurrentHP = Number.isFinite(safeCurrentHP)
    ? Math.max(0, Math.min(normalizedMaxHP, safeCurrentHP))
    : 0;
  const rawPercentage = (normalizedCurrentHP / normalizedMaxHP) * 100;
  const healthPercent = Math.max(0, Math.min(100, rawPercentage));
  const barClass = isPlayer ? 'hp-bar--player' : 'hp-bar--enemy';

  return (
    <div className="hp-bar-wrapper" aria-label={`${label} HP`}>
      <div className="hp-bar-info">
        <span className="hp-bar-label">{label}</span>
        <span className="hp-bar-value">
          {normalizedCurrentHP} / {normalizedMaxHP}
        </span>
      </div>
      <div className="hp-bar-container">
        <div 
          className={`hp-bar-fill ${barClass}`} 
          style={{ width: `${healthPercent}%` }}
        />
      </div>
    </div>
  );
};

export default HealthBar;
