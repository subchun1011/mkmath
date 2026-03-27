const ENGLISH_WORDS = [
  { word: 'apple', meaning: '사과' },
  { word: 'book', meaning: '책' },
  { word: 'cat', meaning: '고양이' },
  { word: 'dog', meaning: '강아지' },
  { word: 'moon', meaning: '달' },
  { word: 'star', meaning: '별' },
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const copied = [...array];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
  }

  return copied;
}

export function generateEnglishQuestion() {
  const selected = randomItem(ENGLISH_WORDS);
  const wrongAnswers = ENGLISH_WORDS
    .filter((item) => item.word !== selected.word)
    .slice(0, 3)
    .map((item) => item.word);

  return {
    question: `"${selected.meaning}"에 맞는 영어 단어는?`,
    answer: selected.word,
    options: shuffle([selected.word, ...wrongAnswers]),
    hint: '그림을 떠올리며 읽어봐!',
  };
}

export default generateEnglishQuestion;
