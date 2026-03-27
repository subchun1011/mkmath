const HANJA_WORDS = [
  { question: '大', answer: '대', meaning: '큰 대' },
  { question: '小', answer: '소', meaning: '작을 소' },
  { question: '山', answer: '산', meaning: '메 산' },
  { question: '水', answer: '수', meaning: '물 수' },
];

function shuffle(array) {
  const copied = [...array];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
  }

  return copied;
}

export function generateHanjaQuestion() {
  const selected = HANJA_WORDS[Math.floor(Math.random() * HANJA_WORDS.length)];
  const wrongAnswers = HANJA_WORDS
    .filter((item) => item.answer !== selected.answer)
    .slice(0, 3)
    .map((item) => item.answer);

  return {
    question: `${selected.question}`,
    answer: selected.answer,
    options: shuffle([selected.answer, ...wrongAnswers]),
    hint: `${selected.meaning}를 떠올려봐!`,
  };
}

export default generateHanjaQuestion;
