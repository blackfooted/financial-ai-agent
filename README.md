# Financial AI Agent

## 1. 프로젝트 개요

- 프로젝트명: 금융 상품 비교 추천 AI 에이전트
- 목적: 사용자 조건 기반 예금·적금·대출 상품 탐색 및 비교 지원
- Phase 1 범위: 금융상품 데이터 기반 상품 후보 조회와 AI 추천 설명
- 서비스 성격: 금융상품 가입 권유가 아닌 참고용 탐색 도구

## 2. 포트폴리오 목표

- 금융 도메인 외부 API 사용 경험 제시
- RAG 기반 AI 추천 서비스 설계 경험 제시
- FastAPI + Next.js 기반 풀스택 MVP 구현 경험 제시
- 금융상품 추천 및 AI 응답 제약 정책 설계 여부 제시
- Render Free Tier 환경에서 경량 배포 구조를 설계한 사례 제시

## 3. 핵심 기능

- 사용자 조건 입력
- 금융상품 데이터 조회
- 조건 기반 상품 후보 필터링
- AI 추천 사유 및 비교 포인트 생성
- 금융 자문 방지 면책 문구 제공

## 4. 기술 스택

- Backend: Python, FastAPI
- Frontend: Next.js App Router, Tailwind CSS
- AI: OpenAI API, GPT-4o-mini
- Data: 금융감독원 금융상품통합비교공시 API
- Deploy: Render Free Tier

## 5. Repo 구조

```text
financial-ai-agent/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── README.md
├── shared/
└── docs/
    └── phase1/
        ├── PRD.md
        ├── scenario.md
        ├── IA.md
        ├── api-spec.md
        ├── data-definition.md
        ├── ai-policy.md
        ├── local-runbook.md
        ├── deployment-plan.md
        └── changelog.md
```

## 6. 문서

- `docs/phase1/PRD.md`: 제품 요구사항 정의
- `docs/phase1/scenario.md`: 사용자 시나리오
- `docs/phase1/IA.md`: 화면 구조
- `docs/phase1/api-spec.md`: API 명세
- `docs/phase1/data-definition.md`: 데이터 정의
- `docs/phase1/ai-policy.md`: AI 응답 정책
- `docs/phase1/local-runbook.md`: 로컬 실행 및 검증 가이드
- `docs/phase1/deployment-plan.md`: Render 배포 준비 문서
- `docs/phase1/changelog.md`: 변경 이력

## 7. 면책 문구

본 서비스는 금융상품 탐색을 돕기 위한 참고용 도구입니다.

제공하는 추천 결과는 금융상품 가입 권유, 투자 권유 또는 금융 자문을 목적으로 하지 않습니다.

실제 가입 전에는 반드시 해당 금융회사와 금융감독원 공시 정보를 확인해야 합니다.

## 8. 로컬 실행

백엔드:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

프론트엔드:

```bash
cd frontend
npm install
npm run dev
```

자세한 로컬 실행 및 검증 방법은 `docs/phase1/local-runbook.md`를 참고합니다.
