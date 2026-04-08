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

  const handleNumberClick = useCallback((value) => {
    onKeyPress?.(String(value));
  }, [onKeyPress]);

  const handleDeleteClick = useCallback(() => {
    onBackspace?.();
  }, [onBackspace]);

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
      <div className="input-display">
        {userInput || <span className="placeholder">?</span>}
      </div>

      <div className="control-panel keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            type="button" 
            className="control-button"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </button>
        ))}
        
        <button className="control-button btn-clear delete-button" type="button" onClick={handleDeleteClick}>
          C
        </button>
        
        <button className="control-button" type="button" onClick={() => handleNumberClick(0)}>
          0
        </button>
        
        <button className="control-button btn-confirm submit-button" type="button" onClick={handleCheck}>
          확인
        </button>
      </div>
    </div>
  );
};

export default InputArea;
