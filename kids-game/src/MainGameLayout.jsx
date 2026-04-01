import React from 'react';

const styles = {
  screen: {
    /* 1. 실제 보이는 화면 높이에 딱 맞춤 (iOS 주소창 대응) */
    width: '100%',
    height: '100dvh', 
    display: 'grid',
    /* 5% 30% 30% 35% 비율 유지 */
    gridTemplateRows: '5% 30% 30% 35%',
    background: 'linear-gradient(180deg, #f7fbff 0%, #fff5d9 100%)',
    overflow: 'hidden',
    
    /* 2. 노치 디자인 및 하단 바 영역 보호 (App.css의 변수 활용) */
    paddingTop: 'var(--safe-top, 0px)',
    paddingBottom: 'var(--safe-bottom, 0px)',
    
    /* 3. 앱처럼 보이게 하는 UX 설정 */
    userSelect: 'none',           /* 텍스트 선택 방지 */
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',   /* 롱탭 메뉴 방지 */
    touchAction: 'manipulation',  /* 더블탭 확대 방지 */
  },
  sectionBase: {
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '2vw', /* 내부 여백 살짝 조절 */
  },
  timerArea: {
    backgroundColor: '#fff8df',
    padding: '0.5vh 2.5vw',
  },
  actionArea: {
    /* 배경은 하위 컴포넌트(우주선)에서 그려지므로 여기선 레이아웃만 유지 */
    background: 'linear-gradient(180deg, #dff4ff 0%, #c8ecff 100%)',
    position: 'relative',
  },
  questionArea: {
    backgroundColor: '#ffffff',
  },
  inputArea: {
    background: 'linear-gradient(180deg, #fff4cc 0%, #ffe7a3 100%)',
    alignItems: 'stretch',
    /* 키패드가 너무 바닥에 붙지 않도록 하단 여백 확보 */
    paddingBottom: 'max(10px, var(--safe-bottom))', 
  },
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
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    border: '3px solid #7cc7f6',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1rem, 3.5vw, 2rem)',
    fontWeight: 700,
    color: '#24506b',
    textAlign: 'center',
  },
  questionCard: {
    width: '100%',
    height: '100%',
    borderRadius: '24px',
    border: '4px solid #ffd166',
    backgroundColor: '#fffdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)',
    fontWeight: 800,
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  inputCard: {
    width: '100%',
    height: '100%',
    borderRadius: '24px',
    border: '3px dashed #f0b429',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1rem, 3vw, 1.8rem)',
    fontWeight: 700,
    color: '#7a5600',
    textAlign: 'center',
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
}) {
  return (
    <main style={styles.screen}>
      {/* 1. 타이머 영역 (5%) */}
      <section style={{ ...styles.sectionBase, ...styles.timerArea }}>
        {renderContent(
          timerContent,
          <div style={styles.timerBarTrack} aria-label="남은 시간">
            <div style={styles.timerBarFill} />
          </div>,
        )}
      </section>

      {/* 2. 액션(우주선) 영역 (30%) */}
      <section style={{ ...styles.sectionBase, ...styles.actionArea }}>
        {renderContent(
          actionContent,
          <div style={styles.actionCard}>로봇 또는 자동차 액션 영역</div>,
        )}
      </section>

      {/* 3. 문제 영역 (30%) */}
      <section style={{ ...styles.sectionBase, ...styles.questionArea }}>
        {renderContent(
          questionContent,
          <div style={styles.questionCard}>문제가 여기에 표시돼요</div>,
        )}
      </section>

      {/* 4. 입력(키패드) 영역 (35%) */}
      <section style={{ ...styles.sectionBase, ...styles.inputArea }}>
        {renderContent(
          inputContent,
          <div style={styles.inputCard}>정답 입력 패드와 확인 버튼 영역</div>,
        )}
      </section>
    </main>
  );
}