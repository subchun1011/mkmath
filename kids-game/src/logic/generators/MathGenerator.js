/**
 * [자릿수 혼합] 레벨에 따라 1자리부터 현재 레벨까지의 자릿수를 무작위로 생성
 */
function getRandomNumberMixed(level) {
  const targetDigit = Math.floor(Math.random() * level) + 1;
  const min = Math.pow(10, targetDigit - 1);
  const max = Math.pow(10, targetDigit) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 오답 옵션 생성 (객관식 UI가 필요할 경우를 대비)
 */
function buildOptions(answer) {
  const numAnswer = Number(answer);
  const wrongAnswers = new Set();
  const range = Math.max(5, Math.ceil(numAnswer * 0.15));

  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * range) + 1;
    const direction = Math.random() < 0.5 ? -1 : 1;
    const candidate = Math.max(0, numAnswer + (offset * direction));
    if (candidate !== numAnswer) wrongAnswers.add(String(candidate));
  }
  
  const options = [String(numAnswer), ...wrongAnswers];
  return options.sort(() => Math.random() - 0.5);
}

/**
 * 1. 덧셈 생성기
 */
function createAddition(level) {
  const num1 = getRandomNumberMixed(level);
  const num2 = getRandomNumberMixed(level);
  const answer = num1 + num2;

  return {
    num1,
    num2,
    operator: '+',
    answer: String(answer),
    options: buildOptions(answer),
    text: `${num1} + ${num2} = ?`
  };
}

/**
 * 2. 뺄셈 생성기 (음수 방지 로직 포함)
 */
function createSubtraction(level) {
  let n1 = getRandomNumberMixed(level);
  let n2 = getRandomNumberMixed(level);
  
  const num1 = Math.max(n1, n2);
  const num2 = Math.min(n1, n2);
  const answer = num1 - num2;

  return {
    num1,
    num2,
    operator: '-',
    answer: String(answer),
    options: buildOptions(answer),
    text: `${num1} - ${num2} = ?`
  };
}

/**
 * 3. 곱셈 생성기 (우측 숫자는 최대 2자리로 제한하여 난이도 조절)
 */
function createMultiplication(level) {
  const multiplicationRanges = {
    1: [2, 4],
    2: [5, 7],
    3: [8, 9],
    4: [10, 15],
    5: [15, 19],
  };

  const [minDan, maxDan] = multiplicationRanges[level] || multiplicationRanges[1];
  const num1 = Math.floor(Math.random() * (maxDan - minDan + 1)) + minDan;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const answer = num1 * num2;

  return {
    num1,
    num2,
    operator: '×',
    answer: String(answer),
    options: buildOptions(answer),
    hint: `${num1}단을 떠올려봐!`,
    text: `${num1} × ${num2} = ?`
  };
}

/**
 * 메인 수학 문제 생성 함수
 */
export function generateMathQuestion(level = 1, subCategory = 'addition') {
  const safeLevel = Math.min(5, Math.max(1, Number(level) || 1));

  switch (subCategory) {
    case 'subtraction':
      return createSubtraction(safeLevel);
    case 'multiplication':
      return createMultiplication(safeLevel);
    case 'addition':
    default:
      return createAddition(safeLevel);
  }
}

export default generateMathQuestion;
