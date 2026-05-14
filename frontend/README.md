# Frontend

## 실행 목적

금융 상품 비교 추천 AI 에이전트 프론트엔드입니다.

현재 Phase 1 화면을 구현했으며, 향후 여러 금융 AI 에이전트를 같은 앱에서 확장할 수 있도록 상단 GNB 형태의 메뉴 구조를 포함합니다.

## 실행 방법

```bash
cd frontend
npm install
npm run dev
```

## 화면 구조

현재 메뉴 구성:

- 상품 비교 추천: 구현 완료
- 이상거래 탐지: 준비 중
- 민원 분류·자동응답: 준비 중
- 기업분석 에이전트: 준비 중

준비 중 메뉴는 현재 기능 구현 없이 안내 메시지만 표시합니다.

## 환경변수

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`NEXT_PUBLIC_API_BASE_URL` 값이 없으면 기본값 `http://localhost:8000`을 사용합니다.

`.env.local`은 직접 생성하되 Git에 커밋하지 않습니다.

## 백엔드 실행 필요

추천 API를 사용하려면 백엔드가 먼저 실행되어 있어야 합니다.

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

백엔드 CORS 설정에 아래 origin이 포함되어 있어야 합니다.

- `http://localhost:3000`
- `http://127.0.0.1:3000`

## 현재 구현 범위

- 상단 GNB 형태의 금융 AI 에이전트 메뉴 구조
- Phase 1 추천 조건 입력 폼
- 백엔드 mock 추천 API 호출
- 추천 결과 카드 표시
- 예금/적금 단순 예상 이자 표시
- 로딩, 오류, 부분 성공, 준비 중 상태 처리

## 제외 범위

- 로그인
- 추천 히스토리
- 준비 중 메뉴 기능 화면
- 실제 OpenAI API 직접 호출
- 실제 금융감독원 API 직접 호출
