import React from 'react';

const styles = {
  screen: {
    width: '100%',
    height: 'var(--app-height, 100dvh)',
    minHeight: '100svh',
    maxHeight: 'var(--app-height, 100dvh)',
    display: 'grid',
    gridTemplateRows: '8fr 70fr 0fr 22fr',
    background: '#000000',
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
    backgroundColor: '#050b14',
    padding: 'clamp(6px, 0.8vh, 10px) clamp(10px, 2.4vw, 18px)',
  },
  actionArea: {
    background: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  questionArea: {
    background: 'transparent',
    padding: '0',
    overflow: 'hidden',
  },
  inputArea: {
    background: 'linear-gradient(180deg, #091426 0%, #0d2035 100%)',
    alignItems: 'stretch',
    paddingBottom: 'max(12px, var(--safe-bottom))',
    position: 'relative',
    zIndex: 10000,
  },
  /* --- 세로셈 전용 스타일 (폰트 사이즈 하향 조정) --- */
  verticalMathStack: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end', // 모든 숫자를 오른쪽(일의 자리) 기준으로 정렬
  justifyContent: 'center',
  fontFamily: '"Courier New", Courier, monospace',
  },
  mathNumber: {
    // 기존 8vh -> 5.5vh로 축소, 최대 크기도 4rem -> 2.8rem으로 축소
    fontSize: 'clamp(1.8rem, 5.5vh, 2.8rem)', 
    fontWeight: 800,
    color: '#2d3748',
    letterSpacing: '6px', // 숫자 간격 살짝 조정
    lineHeight: 1.1,
  },
  operatorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  operatorSymbol: {
    // 연산자 기호도 비율에 맞춰 축소
    fontSize: 'clamp(1.2rem, 4vh, 1.8rem)', 
    fontWeight: 700,
    color: '#ff7675',
    marginRight: '12px',
  },
  mathLine: {
    width: '115%',
    height: '3px', // 선 두께 살짝 얇게
    backgroundColor: '#333',
    margin: '6px 0', // 여백 축소
    borderRadius: '2px',
  },
  answerText: {
  fontSize: 'clamp(1.8rem, 5.5vh, 2.8rem)',
  fontWeight: 800,
  color: '#3182ce',
  letterSpacing: '6px',
  minHeight: '1.2em',
  textAlign: 'right', // 텍스트 자체도 오른쪽 정렬
  width: '100%',     // 부모 너비를 꽉 채워야 정렬이 잘 보임
  },
  /* --- 기존 카드 스타일 유지 --- */
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
  num1 = 0,
  num2 = 0,
  operator = '+',
  userInput = ''
}) {
  return (
    <main style={styles.screen}>
      {/* 1. 타이머 영역 */}
      <section style={{ ...styles.sectionBase, ...styles.timerArea }}>
        {renderContent(timerContent,
          <div style={styles.timerBarTrack} aria-label="남은 시간">
            <div style={styles.timerBarFill} />
          </div>
        )}
      </section>

      {/* 2. 액션 영역 */}
      <section style={{ ...styles.sectionBase, ...styles.actionArea }}>
        {renderContent(actionContent,
          <div style={styles.actionCard}>로봇 또는 자동차 액션 영역</div>
        )}
      </section>

      {/* 3. 문제 영역 - 세로셈 최적화 적용 */}
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

      {/* 4. 입력 영역 */}
      <section style={{ ...styles.sectionBase, ...styles.inputArea }}>
        {renderContent(inputContent,
          <div style={styles.inputCard}>정답 입력 패드 영역</div>
        )}
      </section>
    </main>
  );
}
