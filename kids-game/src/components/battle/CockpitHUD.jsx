import React, { useEffect, useRef, useState } from 'react';
import BattleShipSprite from '../common/battleShipSprite.jsx';
import SpaceshipBattle from '../../actionarea/spaceshipbattle/SpaceshipBattle.jsx';
import HealthBar from '../../actionarea/spaceshipbattle/HealthBar.jsx';
import { getSpriteProps } from '../../constants/battleShipSpriteData.js';
import '../../assets/css/cockpitHUD.css';

function SpaceBattleArea({
  playerHP,
  enemyHP,
  maxHP,
  actionState,
  combo,
  weaponRow,
  missileCol,
}) {
  return (
    <div className="space-battle-backdrop">
      <div className="cockpit-hud__space-stage">
        <SpaceshipBattle
          playerHP={playerHP}
          enemyHP={enemyHP}
          maxHP={maxHP}
          actionState={actionState}
          combo={combo}
          weaponRow={weaponRow}
          missileCol={missileCol}
          showStatusBars={false}
        /> 
      </div>
    </div>
  );
}

function QuestionArea({ questionData, onDistort }) {
  const [isDistorted, setIsDistorted] = useState(false);
  const {
    num1,
    operator,
    num2,
    userInput,
    category,
    hint,
  } = questionData || {};

  useEffect(() => {
    if (
      num1 === undefined &&
      num2 === undefined &&
      !operator &&
      !userInput
    ) {
      return undefined;
    }

    setIsDistorted(true);
    onDistort?.();
    const timer = window.setTimeout(() => {
      setIsDistorted(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [num1, num2, onDistort, operator, userInput]);

  const categoryLabel = category ? String(category).toUpperCase() : 'MISSION';

  return (
    <div className="hologram-wrapper">
      <div className={`cockpit-hud__question ${isDistorted ? 'cockpit-hud__question--distorted' : ''}`}>
        <div className="cockpit-hud__question-badge">{categoryLabel}</div>
        <div className="vertical-math-problem">
          <div className="problem-row num1-row">
            <span className="number">{num1 ?? ''}</span>
          </div>
          <div className="problem-row operator-row">
            <span className="operator">{operator || ''}</span>
            <span className="number">{num2 ?? ''}</span>
          </div>
          <hr className="problem-line" />
          <div className="problem-row answer-row">
            <span className="user-input">{userInput || '\u00A0'}</span>
          </div>
        </div>
        <div className="cockpit-hud__question-hint">
          {hint || '정답을 맞혀 에너지 코어를 충전해봐!'}
        </div>
      </div>
    </div>
  );
}

export default function CockpitHUD({ gameLogic }) {
  if (!gameLogic) {
    console.error('CockpitHUD: gameLogic prop is missing.');
    return <div className="cockpit-hud-container error-state">Loading Game Logic...</div>;
  }

  const {
    playerHP = 0,
    enemyHP = 100,
    maxHP = 1,
    currentQuestion = { question: '...' },
    energyCoreLevel = 0,
    missileCol = 0,
    combo = 0,
    actionState = 'idle',
    weaponRow = 2,
    num1,
    num2,
    operator = '+',
    userInput = '',
    category = 'MISSION',
    hint = '',
    triggerEnergyCoreBurst,
  } = gameLogic;

  const safeMaxHP = maxHP > 0 ? maxHP : 1;
  const hudFixedProps = getSpriteProps('cockpit_hud_fixed');
  const hologramProps = getSpriteProps('hologram_screen');
  const coreState = energyCoreLevel >= 5 ? 'charged' : 'charging';
  const energyCoreProps = getSpriteProps('energy_core_sheet', coreState);

  if (!hudFixedProps?.spriteInfo || !hologramProps?.spriteInfo || !energyCoreProps?.spriteInfo) {
    console.error('CockpitHUD: Failed to load essential sprite props.');
    return <div className="cockpit-hud-container error-state">Loading HUD Assets...</div>;
  }

  const hudShakeClass = actionState === 'enemyFire' ? 'hud-shake' : '';
  const coreScale = 1 + missileCol * 0.08;
  const hologramScale = combo >= 5 ? 1.04 : 1;
  const [showEnergyBurst, setShowEnergyBurst] = useState(false);
  const burstLockRef = useRef(false);

  useEffect(() => {
    if (energyCoreLevel >= 5 && !burstLockRef.current) {
      burstLockRef.current = true;
      setShowEnergyBurst(true);
      triggerEnergyCoreBurst?.();

      const timer = window.setTimeout(() => {
        setShowEnergyBurst(false);
        burstLockRef.current = false;
      }, 700);

      return () => window.clearTimeout(timer);
    }

    if (energyCoreLevel < 5) {
      burstLockRef.current = false;
      setShowEnergyBurst(false);
    }

    return undefined;
  }, [energyCoreLevel, triggerEnergyCoreBurst]);

  return (
    <div className={`cockpit-hud-container ${hudShakeClass}`} style={{ width: '100%', height: '100%' }}>
      <SpaceBattleArea
        playerHP={playerHP}
        enemyHP={enemyHP}
        maxHP={safeMaxHP}
        actionState={actionState}
        combo={combo}
        weaponRow={weaponRow}
        missileCol={missileCol}
      />

      <div className="cockpit-hud__bars">
        <div className="cockpit-hud__bar cockpit-hud__bar--player">
          <HealthBar currentHP={playerHP} maxHP={safeMaxHP} isPlayer={true} label="HERO" />
        </div>
        <div className="cockpit-hud__bar cockpit-hud__bar--enemy">
          <HealthBar currentHP={enemyHP} maxHP={safeMaxHP} isPlayer={false} label="ALIEN" />
        </div>
      </div>

      <div className="hologram-container">
        <BattleShipSprite
          type="hologram_screen"
          state="idle"
          scale={hologramScale}
          style={{ imageRendering: 'pixelated' }}
        />
        <QuestionArea
          questionData={{
            num1,
            operator,
            num2,
            userInput,
            category: currentQuestion?.category || category,
            hint: currentQuestion?.hint || hint,
          }}
          onDistort={() => {}}
        />
      </div>

      <div className="energy-core-container">
        <BattleShipSprite
          type="energy_core_sheet"
          state={coreState}
          scale={coreScale * 1.35}
          animationIterationCount="infinite"
          style={{ imageRendering: 'pixelated' }}
        />
        {showEnergyBurst && <div className="energy-core-burst" />}
      </div>

      <div className="cockpit-hud-base">
        <BattleShipSprite
          type="cockpit_hud_fixed"
          state="idle"
          scale={1.08}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}
