// src/components/VerticalQuestion.jsx
import React from 'react';
import './VerticalMath.css';

const VerticalQuestion = ({ num1, num2, operator, userInput }) => {
  // userInput이 "13"이라면 화면에는 "31"이 아니라 자릿수에 맞춰 "13"으로 보이되,
  // 입력은 일의 자리부터 들어오게 처리합니다.
  
  return (
    <div className="vertical-math-container">
      {/* 첫 번째 숫자 */}
      <div className="math-num">{num1}</div>
      
      {/* 연산자 + 두 번째 숫자 */}
      <div className="math-operator-row">
        <span className="math-operator">{operator}</span>
        <span className="math-num">{num2}</span>
      </div>
      
      {/* 구분선 */}
      <div className="math-line" />
      
      {/* 정답 표시 영역 (일의 자리부터 채워짐) */}
      <div className="math-answer-display">
        {userInput}
        <span className="cursor-blink" />
      </div>
    </div>
  );
};

export default VerticalQuestion;