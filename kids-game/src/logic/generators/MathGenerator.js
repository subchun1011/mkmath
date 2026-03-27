/**
 * [추가] 레벨에 따른 혼합 자릿수 숫자를 생성합니다.
 * 예: Level 3 선택 시 -> 1자리, 2자리, 3자리 중 하나를 먼저 정하고 숫자를 생성.
 */
function getRandomNumberMixed(level) {
  // 1부터 현재 레벨 사이의 자릿수를 무작위로 선택
  const targetDigit = Math.floor(Math.random() * level) + 1;
  
  const min = Math.pow(10, targetDigit - 1);
  const max = Math.pow(10, targetDigit) - 1;
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeLevel(level) {
  const parsedLevel = Number(level);
  if (Number.isNaN(parsedLevel) || parsedLevel < 1) return 1;
  if (parsedLevel > 5) return 5; 
  return Math.floor(parsedLevel);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  const copied = [...array];
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
  }
  return copied;
}

/**
 * 정답을 기반으로 오답 옵션을 생성합니다.
 */
function buildOptions(answer) {
  const numAnswer = Number(answer);
  const correctAnswer = String(answer);
  const wrongAnswers = new Set();
  
  // 정답 크기에 비례하여 오차 범위 설정
  const range = Math.max(5, Math.ceil(numAnswer * 0.15));

  while (wrongAnswers.size < 3) {
    const offset = randomInt(1, range);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const candidate = Math.max(0, numAnswer + (offset * direction));
    
    if (candidate !== numAnswer) {
      wrongAnswers.add(String(candidate));
    }
  }
  return shuffle([correctAnswer, ...wrongAnswers]);
}

// 1. 덧셈 생성기 (혼합 자릿수 적용)
function createAdditionQuestion(level) {
  const left = getRandomNumberMixed(level);
  const right = getRandomNumberMixed(level);
  const answer = left + right;

  return {
    question: `${left} + ${right}`,
    answer: String(answer),
    options: buildOptions(answer),
    hint: `최대 ${level}자리 덧셈에 도전!`,
  };
}

// 2. 뺄셈 생성기 (혼합 자릿수 적용)
function createSubtractionQuestion(level) {
  let left = getRandomNumberMixed(level);
  let right = getRandomNumberMixed(level);

  if (right > left) [left, right] = [right, left];

  const answer = left - right;
  return {
    question: `${left} - ${right}`,
    answer: String(answer),
    options: buildOptions(answer),
    hint: '큰 수에서 작은 수를 빼보자!',
  };
}

// 3. 곱셈 생성기 (곱셈은 난이도를 위해 오른쪽은 최대 2자리로 제한)
function createMultiplicationQuestion(level) {
  const left = getRandomNumberMixed(level);
  // 곱셈은 너무 어려우면 흥미를 잃으므로 오른쪽은 최대 1~2자리만 나오게 조절
  const right = getRandomNumberMixed(Math.min(2, level));
  
  const answer = left * right;
  return {
    question: `${left} × ${right}`,
    answer: String(answer),
    options: buildOptions(answer),
    hint: '구구단을 천천히 떠올려봐!',
  };
}

/**
 * 메인 수학 문제 생성 함수
 */
export function generateMathQuestion(level = 1, subCategory = 'addition') {
  const safeLevel = normalizeLevel(level);

  switch (subCategory) {
    case 'subtraction':
      return createSubtractionQuestion(safeLevel);
    case 'multiplication':
      return createMultiplicationQuestion(safeLevel);
    case 'addition':
    default:
      return createAdditionQuestion(safeLevel);
  }
}

export default generateMathQuestion;