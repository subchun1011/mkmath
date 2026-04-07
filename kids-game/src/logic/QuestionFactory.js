import generateMathQuestion from './generators/MathGenerator.js';
import generateEnglishQuestion from './generators/EnglishGenerator.js';
import generateHanjaQuestion from './generators/HanjaGenerator.js';

const generators = {
  math: generateMathQuestion,
  english: generateEnglishQuestion,
  hanja: generateHanjaQuestion,
};

/**
 * @param {string} category - 'math', 'english', 'hanja'
 * @param {number} level - 1 ~ 5
 * @param {string} subCategory - 'addition', 'subtraction' 등
 */
export function getQuestion(category = 'math', level = 1, subCategory = '') {
  const generator = generators[category] || generators.math;
  
  // 각 제너레이터에 level과 subCategory를 전달하여 문제를 생성합니다.
  const question = generator(level, subCategory);

  return {
    ...question,
    category,
    type: category,
  };
}

export default {
  getQuestion,
};