const ENGLISH_WORDS = [
  { word: 'apple', meaning: '사과' },
  { word: 'banana', meaning: '바나나' },
  { word: 'book', meaning: '책' },
  { word: 'cat', meaning: '고양이' },
  { word: 'dog', meaning: '강아지' },
  { word: 'egg', meaning: '달걀' },
  { word: 'fish', meaning: '물고기' },
  { word: 'house', meaning: '집' },
  { word: 'milk', meaning: '우유' },
  { word: 'moon', meaning: '달' },
  { word: 'star', meaning: '별' },
  { word: 'sun', meaning: '해' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function pickUniqueItems(array, count, excludedValue) {
  const filtered = excludedValue === undefined
    ? [...array]
    : array.filter((item) => item !== excludedValue);

  return shuffle(filtered).slice(0, count);
}

function buildOptions(correctAnswer, wrongAnswers) {
  return shuffle([correctAnswer, ...wrongAnswers]).slice(0, 4);
}

function normalizeLevel(level) {
  const parsedLevel = Number(level);

  if (Number.isNaN(parsedLevel) || parsedLevel < 1) {
    return 1;
  }

  if (parsedLevel > 10) {
    return 10;
  }

  return Math.floor(parsedLevel);
}

function createMathQuestion(level) {
  const safeLevel = normalizeLevel(level);

  let left;
  let right;
  let operator;

  if (safeLevel === 1) {
    left = randomInt(1, 9);
    right = randomInt(1, 9);
    operator = '+';
  } else if (safeLevel <= 4) {
    left = randomInt(2, 20);
    right = randomInt(1, 9);
    operator = Math.random() < 0.7 ? '+' : '-';

    if (operator === '-' && left < right) {
      [left, right] = [right, left];
    }
  } else if (safeLevel === 5) {
    left = randomInt(10, 99);
    right = randomInt(10, 99);
    operator = '-';

    if (left < right) {
      [left, right] = [right, left];
    }
  } else if (safeLevel <= 9) {
    left = randomInt(10, 99);
    right = randomInt(1, 20);
    operator = Math.random() < 0.5 ? '+' : '-';

    if (operator === '-' && left < right) {
      [left, right] = [right, left];
    }
  } else {
    left = randomInt(2, 9);
    right = randomInt(2, 9);
    operator = 'x';
  }

  let answer;

  if (operator === '+') {
    answer = left + right;
  } else if (operator === '-') {
    answer = left - right;
  } else {
    answer = left * right;
  }

  const wrongAnswers = new Set();

  while (wrongAnswers.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.ceil(answer / 3) || 3));
    const candidate = Math.max(0, answer + (Math.random() < 0.5 ? -offset : offset));

    if (candidate !== answer) {
      wrongAnswers.add(candidate);
    }
  }

  const stringAnswer = String(answer);

  return {
    question: `${left} ${operator} ${right} = ?`,
    answer: stringAnswer,
    options: buildOptions(
      stringAnswer,
      [...wrongAnswers].map((value) => String(value)),
    ),
    type: 'math',
  };
}

function createEnglishQuestion() {
  const selectedWord = ENGLISH_WORDS[randomInt(0, ENGLISH_WORDS.length - 1)];
  const wrongAnswers = pickUniqueItems(
    ENGLISH_WORDS.map((item) => item.word),
    3,
    selectedWord.word,
  );

  return {
    question: `"${selectedWord.meaning}"에 맞는 영어 단어는 무엇일까요?`,
    answer: selectedWord.word,
    options: buildOptions(selectedWord.word, wrongAnswers),
    type: 'english',
  };
}

function generateQuestion(category, level = 1) {
  if (category === 'math') {
    return createMathQuestion(level);
  }

  if (category === 'english') {
    return createEnglishQuestion();
  }

  throw new Error(`Unsupported category: ${category}`);
}

module.exports = {
  ENGLISH_WORDS,
  generateQuestion,
};
