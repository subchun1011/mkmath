import generateMathQuestion from './generators/MathGenerator.js';
import generateEnglishQuestion from './generators/EnglishGenerator.js';
import generateHanjaQuestion from './generators/HanjaGenerator.js';

const generators = {
  math: generateMathQuestion,
  english: generateEnglishQuestion,
  hanja: generateHanjaQuestion,
};

export function getQuestion(category = 'math', level = 1, subCategory = '') {
  const generator = generators[category] || generators.math;
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
