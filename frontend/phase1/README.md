# Phase 1 Frontend

## 실행 목적

금융 상품 비교 추천 AI 에이전트 Phase 1 프론트엔드입니다.

## 실행 방법

```bash
cd frontend/phase1
npm install
npm run dev
```

## 환경변수

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

`.env.local`은 직접 생성하되 Git에 커밋하지 않습니다.

## 백엔드 실행 필요

추천 API를 사용하려면 백엔드가 먼저 실행되어 있어야 합니다.

```bash
cd backend/phase1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

백엔드 CORS 설정에 아래 origin이 포함되어 있어야 합니다.

- `http://localhost:3000`
- `http://127.0.0.1:3000`

## 현재 구현 범위

- 단일 추천 페이지
- 조건 입력 폼
- 백엔드 mock 추천 API 호출
- 추천 결과 표시
- 로딩/오류/부분 성공 상태 처리

## 제외 범위

- 로그인
- 추천 히스토리
- 실제 OpenAI API 직접 호출
- 실제 금융감독원 API 직접 호출
