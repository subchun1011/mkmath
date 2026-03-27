import React, { useState } from 'react';

const SelectionScreen = ({ onStartGame }) => {
  const [step, setStep] = useState(0); // 0: 과목, 1: 연산, 2: 레벨
  const [config, setConfig] = useState({ category: '', subCategory: '', level: 1 });

  // 1단계: 과목 선택
  const selectCategory = (cat) => {
    setConfig({ ...config, category: cat });
    // 수학만 연산 선택(Step 1)으로 가고, 영어/한자는 바로 레벨 선택(Step 2)으로 넘기기
    setStep(cat === 'math' ? 1 : 2);
  };

  // 2단계: 연산 선택 (수학 전용)
  const selectSub = (sub) => {
    setConfig({ ...config, subCategory: sub });
    setStep(2);
  };

  // 3단계: 레벨 선택 및 최종 시작
  const selectLevel = (lvl) => {
    onStartGame({ ...config, level: lvl });
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        {step === 0 && "🚀 과목을 골라보세요!"}
        {step === 1 && "➕ 어떤 계산을 할까요?"}
        {step === 2 && "⭐ 난이도를 골라보세요!"}
      </h1>

      <div style={btnGroupStyle}>
        {/* Step 0: 수학, 영어, 한자 */}
        {step === 0 && (
          <>
            <button style={mainBtnStyle} onClick={() => selectCategory('math')}>수학</button>
            <button style={mainBtnStyle} onClick={() => selectCategory('english')}>영어</button>
            <button style={mainBtnStyle} onClick={() => selectCategory('hanja')}>한자</button>
          </>
        )}

        {/* Step 1: 더하기, 빼기, 곱하기 */}
        {step === 1 && (
          <>
            <button style={subBtnStyle} onClick={() => selectSub('addition')}>더하기</button>
            <button style={subBtnStyle} onClick={() => selectSub('subtraction')}>빼기</button>
            <button style={subBtnStyle} onClick={() => selectSub('multiplication')}>곱하기</button>
          </>
        )}

        {/* Step 2: 레벨 1~5 */}
        {step === 2 && (
          [1, 2, 3, 4, 5].map(lvl => (
            <button key={lvl} style={levelBtnStyle} onClick={() => selectLevel(lvl)}>
              LEVEL {lvl}
            </button>
          ))
        )}
      </div>

      {step > 0 && (
        <button style={backLinkStyle} onClick={() => setStep(step - 1)}>뒤로 가기</button>
      )}
    </div>
  );
};

// --- 스타일 (CSS 파일로 분리 추천) ---
const containerStyle = { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#051937', color: '#fff' };
const titleStyle = { marginBottom: '30px', fontSize: '1.8rem' };
const btnGroupStyle = { display: 'flex', flexDirection: 'column', gap: '15px', width: '220px' };
const baseBtnStyle = { padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: '0.2s' };
const mainBtnStyle = { ...baseBtnStyle, background: '#4a90e2', color: '#fff' };
const subBtnStyle = { ...baseBtnStyle, background: '#2ecc71', color: '#fff' };
const levelBtnStyle = { ...baseBtnStyle, background: '#f1c40f', color: '#333' };
const backLinkStyle = { marginTop: '20px', background: 'none', border: '1px solid #fff', color: '#fff', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' };

export default SelectionScreen;