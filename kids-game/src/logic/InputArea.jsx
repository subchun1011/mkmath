import React, { useState, useCallback } from 'react';
import './InputArea.css';

const InputArea = ({ 
  userInput, 
  correctAnswer, 
  onKeyPress, 
  onBackspace, 
  onCorrect, 
  onWrong 
}) => {
  const [isShaking, setIsShaking] = useState(false);

  /**
   * 정답 체크 로직
   * 부모의 userInput과 correctAnswer를 비교합니다.
   */
  const handleCheck = useCallback(() => {
    if (!userInput) return;

    console.log("--- 정답 체크 ---");
    console.log("유저 입력:", userInput);
    console.log("실제 정답:", correctAnswer);

    const userAns = String(userInput).trim();
    const targetAns = String(correctAnswer).trim();

    if (userAns === targetAns) {
      console.log("결과: 정답입니다! ⭕");
      onCorrect(); 
    } else {
      console.log("결과: 틀렸습니다! ❌");
      setIsShaking(true);
      onWrong();
      
      // 0.5초 후 흔들림 효과 제거
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  }, [userInput, correctAnswer, onCorrect, onWrong]);

  return (
    <div className={`input-area-container ${isShaking ? 'shake' : ''}`}>
      {/* 부모(StageGameScreen)에서 관리하는 userInput을 직접 보여줍니다. 
          세로셈 로직이 적용되어 입력할수록 숫자가 왼쪽으로 밀려납니다.
      */}
      <div className="input-display">
        {userInput || <span className="placeholder">?</span>}
      </div>

      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            type="button" 
            onClick={() => onKeyPress(String(num))}
          >
            {num}
          </button>
        ))}
        
        {/* 지우기: 부모의 역순 지우기 로직 호출 */}
        <button className="btn-clear" type="button" onClick={onBackspace}>
          C
        </button>
        
        <button type="button" onClick={() => onKeyPress('0')}>
          0
        </button>
        
        {/* 확인: 내부의 handleCheck 실행 */}
        <button className="btn-confirm" type="button" onClick={handleCheck}>
          확인
        </button>
      </div>
    </div>
  );
};

export default InputArea;