import React, { useState } from 'react';
import './InputArea.css';

const InputArea = ({ correctAnswer, onCorrect, onWrong }) => {
  const [inputValue, setInputValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleNumberClick = (num) => {
    if (inputValue.length < 5) {
      setInputValue((prev) => prev + num);
    }
  };

  const handleClear = () => setInputValue('');

  const handleCheck = () => {
    if (!inputValue) return;

    // [디버깅 로그] F12를 눌러 콘솔창에서 값이 일치하는지 꼭 확인해보세요!
    console.log("--- 정답 체크 ---");
    console.log("유저 입력:", inputValue, `(타입: ${typeof inputValue})`);
    console.log("실제 정답:", correctAnswer, `(타입: ${typeof correctAnswer})`);

    // 확실하게 문자열로 변환하고 공백 제거 후 비교
    const userAns = String(inputValue).trim();
    const targetAns = String(correctAnswer).trim();

    if (userAns === targetAns) {
      console.log("결과: 정답입니다! ⭕");
      onCorrect(); 
      setInputValue('');
    } else {
      console.log("결과: 틀렸습니다! ❌");
      setIsShaking(true);
      onWrong();
      
      setTimeout(() => {
        setIsShaking(false);
        setInputValue('');
      }, 500);
    }
  };

  return (
    <div className={`input-area-container ${isShaking ? 'shake' : ''}`}>
      <div className="input-display">
        {inputValue || <span className="placeholder">?</span>}
      </div>

      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} onClick={() => handleNumberClick(num)}>
            {num}
          </button>
        ))}
        <button className="btn-clear" onClick={handleClear}>C</button>
        <button onClick={() => handleNumberClick(0)}>0</button>
        <button className="btn-confirm" onClick={handleCheck}>확인</button>
      </div>
    </div>
  );
};

export default InputArea;