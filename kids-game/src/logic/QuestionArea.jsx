import React from 'react';
import './QuestionArea.css';

const QuestionArea = ({ questionData, isTransitioning = false }) => {
  if (!questionData) {
    return <div className="loading">문제를 불러오는 중...</div>;
  }

  const { question, hint, category } = questionData;

  return (
    <div
      className={`question-container ${category} ${
        isTransitioning ? 'question-fade-out' : 'question-fade-in'
      }`}
    >
      {/* 과목 뱃지는 문제 유형을 한눈에 알아보게 해준다. */}
      <div className="category-badge">{category.toUpperCase()}</div>

      {/* 실제 문제 텍스트는 중앙에 크게 보여서 저학년 아이도 바로 읽을 수 있게 한다. */}
      <div className="question-text">
        {question}
      </div>

      {/* 힌트는 선택 정보가 아니라 학습 보조 정보라서 보조 텍스트로 분리한다. */}
      {hint && <div className="hint-text">힌트: {hint}</div>}
    </div>
  );
};

export default QuestionArea;
