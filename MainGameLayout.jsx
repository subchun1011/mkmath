import React from 'react';

const styles = {
  screen: {
    width: '100%',
    height: '100dvh', // 모바일 브라우저 최적화
    display: 'grid',
    gridTemplateRows: '5% 30% 30% 35%',
    background: 'linear-gradient(180deg, #f7fbff 0%, #fff5d9 100%)',
    overflow: 'hidden',
    /* Safe Area 대응 */
    paddingTop: 'var(--safe-top, 0px)',
    paddingBottom: 'var(--safe-bottom, 0px)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
  },
  sectionBase: {
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '2.5vw',
  },
  timerArea: {
    backgroundColor: '#fff8df',
    padding: '1vw 2.5vw',
  },
  actionArea: {
    background: 'linear-gradient(180deg, #dff4ff 0%, #c8ecff 100%)',
    /* HP바 노출을 위해 아이템들을 바닥 정렬 */
    alignItems: 'flex-end',
    paddingBottom: '15px',
  },
  questionArea: {
    backgroundColor: '#ffffff',
  },
  inputArea: {
    background: 'linear-gradient(180deg, #fff4cc 0%, #ffe7a3 100%)',
    alignItems: 'stretch',
    paddingBottom: 'max(12px, var(--safe-bottom))',
  },
  
  /* --- 세로셈(Vertical Math) 전용 스타일 --- */
  verticalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // 오른쪽 자릿수 맞춤 핵심
    padding: '0 20px',
  },
  mathNum: {
    fontSize: 'clamp(2.5rem, 8vh, 4rem)',
    fontWeight: 800,
    color: '#2d3748',
    fontFamily: '"Courier New", Courier, monospace', // 숫자 간격 고정
    letterSpacing: '10px',
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
    width: '120%',
    height: '4px',
    backgroundColor: '#333',
    margin: '8px 0',
    borderRadius: '2px',
  },
  answerDisplay: {
    fontSize: 'clamp(2.5rem, 8vh, 4rem)',
    fontWeight: 800,
    color: '#3182ce', // 입력값은 파란색
    fontFamily: '"Courier New", Courier, monospace',
    letterSpacing: '10px',
    minHeight: '1.2em',
  },

  /* --- 기존 카드 스타일 유지 --- */
  timerBarTrack: {
    width: '100%', height: '12px', borderRadius: '999px',
    backgroundColor: 'rgba(47, 84, 109, 0.15)', overflow: 'hidden',
  },
  timerBarFill: {
    width: '70%', height: '100%', borderRadius: '999px',
    background: 'linear-gradient(90deg, #58d68d 0%, #f4d03f 60%, #ff7675 100%)',
    transition: 'width 0.3s ease',
  },
  actionCard: {
    width: '100%', height: '100%', borderRadius: '24px', border: '3px solid #7cc7f6',
    backgroundColor: 'rgba(255, 255, 255, 0.72)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', fontWeight: 700,
    color: '#24506b', textAlign: 'center',
  },
  questionCard: {
    width: '100%', height: '100%', borderRadius: '28px', border: '4px solid #ffd166',
    backgroundColor: '#fffdf5', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    width: '100%', height: '100%', borderRadius: '28px', border: '3px dashed #f0b429',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 'clamp(1.2rem, 3.5vw, 2rem)', fontWeight: 700,
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
  // 세로셈을 위한 새로운 props
  num1 = 32,
  num2 = 7,
  operator = '+',
  userInput = ''
}) {
  return (
    <main style={styles.screen}>
      {/* 1. 타이머 영역 */}
      <section style={{ ...styles.sectionBase, ...styles.timerArea }}>
        {renderContent(
          timerContent,
          <div style={styles.timerBarTrack} aria-label="남은 시간">
            <div style={styles.timerBarFill} />
          </div>,
        )}
      </section>

      {/* 2. 액션(우주선) 영역 */}
      <section style={{ ...styles.sectionBase, ...styles.actionArea }}>
        {renderContent(
          actionContent,
          <div style={styles.actionCard}>로봇 또는 자동차 액션 영역</div>,
        )}
      </section>

      {/* 3. 문제 영역 (세로셈 적용) */}
      <section style={{ ...styles.sectionBase, ...styles.questionArea }}>
        {renderContent(
          questionContent,
          <div style={styles.questionCard}>
            <div style={styles.verticalContainer}>
              {/* 첫번째 숫자 */}
              <div style={styles.mathNum}>{num1}</div>
              {/* 연산자 + 두번째 숫자 */}
              <div style={styles.operatorRow}>
                <span style={styles.operatorSymbol}>{operator}</span>
                <span style={styles.mathNum}>{num2}</span>
              </div>
              {/* 가로줄 */}
              <div style={styles.mathLine} />
              {/* 정답 표시 (일의 자리부터 입력됨) */}
              <div style={styles.answerDisplay}>{userInput}</div>
            </div>
          </div>,
        )}
      </section>

      {/* 4. 입력 영역 */}
      <section style={{ ...styles.sectionBase, ...styles.inputArea }}>
        {renderContent(
          inputContent,
          <div style={styles.inputCard}>정답 입력 패드 영역</div>,
        )}
      </section>
    </main>
  );
}