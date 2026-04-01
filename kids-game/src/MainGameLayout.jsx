import React from 'react';

const styles = {
  screen: {
    width: '100%',
    height: 'var(--app-height, 100dvh)',
    minHeight: '100svh',
    maxHeight: 'var(--app-height, 100dvh)',
    display: 'grid',
    gridTemplateRows: '5fr 30fr 30fr 35fr',
    background: 'linear-gradient(180deg, #f7fbff 0%, #fff5d9 100%)',
    overflow: 'hidden',
    paddingTop: 'var(--safe-top, 0px)',
    paddingBottom: 'var(--safe-bottom, 0px)',
    paddingLeft: 'var(--safe-left, 0px)',
    paddingRight: 'var(--safe-right, 0px)',
    boxSizing: 'border-box',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    touchAction: 'manipulation',
  },
  sectionBase: {
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: 'clamp(8px, 1.6vh, 16px) clamp(10px, 2.4vw, 18px)',
  },
  timerArea: {
    backgroundColor: '#fff8df',
    padding: 'clamp(6px, 0.8vh, 10px) clamp(10px, 2.4vw, 18px)',
  },
  actionArea: {
    background: 'linear-gradient(180deg, #dff4ff 0%, #c8ecff 100%)',
    position: 'relative',
  },
  questionArea: {
    backgroundColor: '#ffffff',
  },
  inputArea: {
    background: 'linear-gradient(180deg, #fff4cc 0%, #ffe7a3 100%)',
    alignItems: 'stretch',
    paddingBottom: 'max(12px, var(--safe-bottom))',
  },
  /* --- 세로셈 전용 스타일 추가 --- */
  verticalMathStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // 오른쪽 자릿수 맞춤 핵심
    fontFamily: '"Courier New", Courier, monospace', // 숫자 폭 일정하게
  },
  mathNumber: {
    fontSize: 'clamp(2.5rem, 8vh, 4rem)',
    fontWeight: 800,
    color: '#2d3748',
    letterSpacing: '4px',
    lineHeight: 1.1,
  },
  operatorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  operatorSymbol: {
    fontSize: 'clamp(1.5rem, 5vh, 2.5rem)',
    fontWeight: 700,
    color: '#ff7675',
    marginRight: '15px',
  },
  mathLine: {
    width: '110%',
    height: '4px',
    backgroundColor: '#333',
    margin: '8px 0',
    borderRadius: '2px',
  },
  answerText: {
    fontSize: 'clamp(2.5rem, 8vh, 4rem)',
    fontWeight: 800,
    color: '#3182ce', // 입력값은 파란색으로 강조
    minHeight: '1.2em',
    letterSpacing: '4px',
  },
  /* --- 기존 카드 스타일 유지/보완 --- */
  timerBarTrack: {
    width: '100%',
    height: '12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(47, 84, 109, 0.15)',
    overflow: 'hidden',
  },
  timerBarFill: {
    width: '70%',
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #58d68d 0%, #f4d03f 60%, #ff7675 100%)',
    transition: 'width 0.3s ease',
  },
  actionCard: {
    width: '100%', height: '100%', borderRadius: '20px', border: '3px solid #7cc7f6',
    backgroundColor: 'rgba(255, 255, 255, 0.72)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 'clamp(1rem, 3.5vw, 2rem)', fontWeight: 700,
    color: '#24506b', textAlign: 'center',
  },
  questionCard: {
    width: '100%', height: '100%', borderRadius: '24px', border: '4px solid #ffd166',
    backgroundColor: '#fffdf5', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    width: '100%', height: '100%', borderRadius: '24px', border: '3px dashed #f0b429',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 'clamp(1rem, 3vw, 1.8rem)', fontWeight: 700,
    color: '#7a5600', textAlign: 'center',
  },
};

function renderContent(content, fallback) {
  return content ?? fallback;
}

export default function MainGameLayout({
  timerContent,
  actionContent,
  questionContent,
  inputContent,
  // 세로셈용 데이터 추가 (부모로부터 받음)
  num1 = 0,
  num2 = 0,
  operator = '+',
  userInput = ''
}) {
  return (
    <main style={styles.screen}>
      {/* 1. 타이머 영역 (5%) */}
      <section style={{ ...styles.sectionBase, ...styles.timerArea }}>
        {renderContent(timerContent,
          <div style={styles.timerBarTrack} aria-label="남은 시간">
            <div style={styles.timerBarFill} />
          </div>
        )}
      </section>

      {/* 2. 액션(우주선) 영역 (30%) */}
      <section style={{ ...styles.sectionBase, ...styles.actionArea }}>
        {renderContent(actionContent,
          <div style={styles.actionCard}>로봇 또는 자동차 액션 영역</div>
        )}
      </section>

      {/* 3. 문제 영역 (30%) - 세로셈 적용 */}
      <section style={{ ...styles.sectionBase, ...styles.questionArea }}>
        {renderContent(questionContent,
          <div style={styles.questionCard}>
            <div style={styles.verticalMathStack}>
              <div style={styles.mathNumber}>{num1}</div>
              <div style={styles.operatorRow}>
                <span style={styles.operatorSymbol}>{operator}</span>
                <span style={styles.mathNumber}>{num2}</span>
              </div>
              <div style={styles.mathLine} />
              <div style={styles.answerText}>
                {userInput}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. 입력(키패드) 영역 (35%) */}
      <section style={{ ...styles.sectionBase, ...styles.inputArea }}>
        {renderContent(inputContent,
          <div style={styles.inputCard}>정답 입력 패드 영역</div>
        )}
      </section>
    </main>
  );
}