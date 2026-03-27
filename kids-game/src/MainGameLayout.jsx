import React from 'react';

const styles = {
  screen: {
    width: '100%',
    height: '100dvh',
    minHeight: '100vh',
    display: 'grid',
    gridTemplateRows: '5% 30% 30% 35%',
    background: 'linear-gradient(180deg, #f7fbff 0%, #fff5d9 100%)',
    overflow: 'hidden',
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
  },
  questionArea: {
    backgroundColor: '#ffffff',
  },
  inputArea: {
    background: 'linear-gradient(180deg, #fff4cc 0%, #ffe7a3 100%)',
    alignItems: 'stretch',
  },
  timerBarTrack: {
    width: '100%',
    height: '100%',
    minHeight: '10px',
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
    borderRadius: '24px',
    border: '3px solid #7cc7f6',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1.4rem, 4vw, 2.6rem)',
    fontWeight: 700,
    color: '#24506b',
    textAlign: 'center',
  },
  questionCard: {
    width: '100%',
    height: '100%',
    borderRadius: '28px',
    border: '4px solid #ffd166',
    backgroundColor: '#fffdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: 800,
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  inputCard: {
    width: '100%',
    height: '100%',
    borderRadius: '28px',
    border: '3px dashed #f0b429',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
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
      <section style={{ ...styles.sectionBase, ...styles.timerArea }}>
        {renderContent(
          timerContent,
          <div style={styles.timerBarTrack} aria-label="남은 시간">
            <div style={styles.timerBarFill} />
          </div>,
        )}
      </section>

      <section style={{ ...styles.sectionBase, ...styles.actionArea }}>
        {renderContent(
          actionContent,
          <div style={styles.actionCard}>로봇 또는 자동차 액션 영역</div>,
        )}
      </section>

      <section style={{ ...styles.sectionBase, ...styles.questionArea }}>
        {renderContent(
          questionContent,
          <div style={styles.questionCard}>문제가 여기에 표시돼요</div>,
        )}
      </section>

      <section style={{ ...styles.sectionBase, ...styles.inputArea }}>
        {renderContent(
          inputContent,
          <div style={styles.inputCard}>정답 입력 패드와 확인 버튼 영역</div>,
        )}
      </section>
    </main>
  );
}
