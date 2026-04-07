# Screen Spec 2

이 문서는 다른 에이전트나 LLM이 프로젝트를 빠르게 이해할 수 있도록 작성한 보조 명세입니다.  
특히 화면 역할, 데이터 흐름, 수정 시 주의점을 중심으로 설명합니다.

## 1. App Entry

파일: [`kids-game/src/App.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/App.jsx)

- 앱의 최상위 진입점입니다.
- 현재 흐름은 `SelectionScreen -> StageGameScreen`입니다.
- `CoinProvider`로 전체 앱을 감싸 전역 코인 상태를 제공합니다.
- `--app-height` CSS 변수를 `window.innerHeight` 기준으로 갱신해 모바일 브라우저 주소창 변화에 대응합니다.

핵심 포인트:

- 웹 브라우저와 앱 웹뷰 모두에서 실제 보이는 높이를 기준으로 맞추려는 구조입니다.
- 고정 `100vh`보다 `--app-height`와 `100dvh`를 우선 사용합니다.

## 2. Selection Screen

파일: [`kids-game/src/SelectionScreen.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/SelectionScreen.jsx)

- 게임 시작 전 과목, 연산 종류, 레벨을 고르는 화면입니다.
- 현재는 수학 중심 흐름이 열려 있고, 영어/한자는 일부 주석 처리되어 있습니다.
- 선택 결과는 `config` 객체 형태로 `App.jsx`에 전달됩니다.

핵심 포인트:

- `category`
- `subCategory`
- `level`

이 세 값이 이후 문제 생성과 게임 화면 제목에 직접 연결됩니다.

## 3. Main Game Layout

파일: [`kids-game/src/MainGameLayout.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/MainGameLayout.jsx)

- 전체 게임 플레이 화면을 4영역으로 나누는 핵심 레이아웃입니다.
- 비율은 다음과 같습니다.
  - Timer/HUD: 5
  - Action Area: 30
  - Question Area: 30
  - Input Area: 35

핵심 포인트:

- `gridTemplateRows: '5fr 30fr 30fr 35fr'`
- `safe-area inset`을 내부 padding으로 처리
- 모바일 브라우저와 웹뷰 모두에서 전체 화면 꽉 채우기 목적

수정 시 주의:

- 각 영역 비율은 `SPEC.md` 핵심 요구사항이라 함부로 바꾸지 않는 편이 좋습니다.
- 높이 문제는 `MainGameLayout`과 `StageGameScreen.css`를 함께 봐야 합니다.

## 4. Stage Game Screen

파일: [`kids-game/src/StageGameScreen.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/StageGameScreen.jsx)

- 실제 플레이가 이루어지는 메인 화면입니다.
- 상단 HUD, 우주선 배틀 액션, 문제 표시, 숫자 입력을 한 화면에 묶습니다.
- `MainGameLayout`에 각 영역 컴포넌트를 주입하는 방식입니다.

주요 상태:

- `currentQuestion`
- `userInput`
- `playerHP`
- `enemyHP`
- `actionState`
- `coins`
- `isWin`
- `isGameOver`

주요 흐름:

1. `QuestionFactory.getQuestion()`으로 문제 생성
2. `InputArea`에서 숫자 입력
3. 정답이면 `processCorrect()`
4. 오답이면 `processWrong()`
5. 전투 상태와 HP가 `SpaceshipBattle`에 반영
6. 승패 시 결과 오버레이 표시

핵심 포인트:

- 현재 액션 영역은 로봇보다 우주선 전투 UI에 가깝습니다.
- HUD는 상단 5% 안에 들어가므로 버튼/텍스트 길이를 짧게 유지해야 합니다.

## 5. Question System

관련 파일:

- [`kids-game/src/logic/QuestionFactory.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/QuestionFactory.js)
- [`kids-game/src/logic/generators/MathGenerator.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/generators/MathGenerator.js)
- [`kids-game/src/logic/generators/EnglishGenerator.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/generators/EnglishGenerator.js)
- [`kids-game/src/logic/generators/HanjaGenerator.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/generators/HanjaGenerator.js)

역할:

- 과목별 생성기를 `QuestionFactory`가 묶어서 공통 인터페이스로 제공합니다.
- 반환 형식은 기본적으로 아래 형태를 따릅니다.

```js
{
  question: '6 + 7',
  answer: '13',
  options: ['12', '13', '14', '11'],
  hint: '...',
  category: 'math',
  type: 'math'
}
```

핵심 포인트:

- 새 과목을 추가할 때는 `generators/`에 파일 추가 후 `QuestionFactory.js`에 등록하면 됩니다.
- `StageGameScreen.jsx`는 `question`, `answer`, 경우에 따라 `num1`, `num2`, `operator`도 활용합니다.

## 6. Question Area

관련 파일:

- [`kids-game/src/logic/QuestionArea.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/QuestionArea.jsx)
- [`kids-game/src/logic/QuestionArea.css`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/QuestionArea.css)

역할:

- 문제 카드와 과목 배지, 힌트를 보여줍니다.

핵심 포인트:

- 큰 숫자/연산 텍스트가 중심입니다.
- `clamp()`로 폰트 크기를 조절해 작은 폰에서도 넘치지 않게 설계되어 있습니다.

## 7. Input Area

관련 파일:

- [`kids-game/src/logic/InputArea.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/InputArea.jsx)
- [`kids-game/src/logic/InputArea.css`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/InputArea.css)

역할:

- 숫자 패드 입력
- 지우기
- 정답 제출

핵심 포인트:

- 하단 35%를 차지하는 가장 압축이 심한 영역입니다.
- 버튼 잘림 문제는 대부분 여기와 `StageGameScreen`/`MainGameLayout` 높이 계산이 엮여 있습니다.

## 8. Space Battle Action Area

관련 파일:

- [`kids-game/src/actionarea/spaceshipbattle/SpaceshipBattle.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/actionarea/spaceshipbattle/SpaceshipBattle.jsx)
- [`kids-game/src/actionarea/spaceshipbattle/SpaceshipBattle.css`](/Users/ttongchun/Documents/mkMath/kids-game/src/actionarea/spaceshipbattle/SpaceshipBattle.css)
- [`kids-game/src/actionarea/spaceshipbattle/HealthBar.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/actionarea/spaceshipbattle/HealthBar.jsx)
- [`kids-game/src/actionarea/spaceshipbattle/ComboEffect.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/actionarea/spaceshipbattle/ComboEffect.jsx)

역할:

- 플레이어/적 비행선 표시
- HP 바
- 미사일 발사 애니메이션
- 피격 이펙트
- 콤보/무기 연출

핵심 포인트:

- 현재 디자인은 픽셀 우주선 스프라이트 기반입니다.
- 스프라이트 좌표는 `battleShipSpriteData.js`에 정의됩니다.
- `actionState` 값에 따라 발사/피격 애니메이션이 바뀝니다.

예시 상태:

- `idle`
- `playerFire`
- `enemyFire`

## 9. Coin System

파일: [`kids-game/src/coins/CoinContext.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/coins/CoinContext.jsx)

역할:

- 전역 코인 상태 관리

핵심 포인트:

- `coins`
- `earnCoins(amount)`
- `spendCoins(amount)`

다른 화면이나 상점을 붙일 때 이 Context를 재사용하는 것이 좋습니다.

## 10. Hooks

관련 파일:

- [`kids-game/src/hooks/useSpaceBattleLogic.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/hooks/useSpaceBattleLogic.js)
- [`kids-game/src/hooks/useGameLogic.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/hooks/useGameLogic.js)

역할:

- 화면 컴포넌트에서 상태 갱신 로직을 분리합니다.

`useSpaceBattleLogic` 주요 책임:

- 플레이어 HP
- 적 HP
- 액션 상태
- 콤보
- 무기 위치/열
- 정답/오답 처리
- 승패 판정

## 11. Sprite System

관련 파일:

- [`kids-game/src/components/common/battleShipSprite.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/components/common/battleShipSprite.jsx)
- [`kids-game/src/constants/battleShipSpriteData.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/constants/battleShipSpriteData.js)

역할:

- 하나의 스프라이트 시트에서 플레이어 우주선, 적 우주선, 미사일, 폭발 이펙트를 잘라서 렌더링합니다.

핵심 포인트:

- `type`: `player | enemy | missile | effect`
- `index`: 미사일/이펙트 종류 선택
- `scale`: 확대 배율

## 12. Responsive / WebView Notes

이 프로젝트는 향후 앱 웹뷰 제공을 고려하고 있으므로 다음 원칙이 중요합니다.

- `viewport-fit=cover` 유지
- `safe-area inset` 사용
- 고정 `100vh`보다 `--app-height`, `100dvh`, `100svh` 우선
- 상단 HUD는 텍스트를 짧게 유지
- 하단 입력 영역은 작은 화면에서 버튼 크기와 gap이 자동으로 줄어들어야 함

수정 우선순위:

1. `App.jsx`
2. `MainGameLayout.jsx`
3. `StageGameScreen.css`
4. `InputArea.css`
5. `QuestionArea.css`

## 13. Recommended Reading Order For Another Agent

다른 에이전트가 이 프로젝트를 이해할 때 권장 순서는 다음과 같습니다.

1. [`kids-game/src/App.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/App.jsx)
2. [`kids-game/src/StageGameScreen.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/StageGameScreen.jsx)
3. [`kids-game/src/MainGameLayout.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/MainGameLayout.jsx)
4. [`kids-game/src/hooks/useSpaceBattleLogic.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/hooks/useSpaceBattleLogic.js)
5. [`kids-game/src/logic/QuestionFactory.js`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/QuestionFactory.js)
6. [`kids-game/src/actionarea/spaceshipbattle/SpaceshipBattle.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/actionarea/spaceshipbattle/SpaceshipBattle.jsx)
7. [`kids-game/src/logic/InputArea.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/InputArea.jsx)
8. [`kids-game/src/logic/QuestionArea.jsx`](/Users/ttongchun/Documents/mkMath/kids-game/src/logic/QuestionArea.jsx)
