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

## 배포 상태

Phase 1 mock/FSS 기반 MVP는 Render에 배포되었습니다.

- Frontend: `<프론트엔드 Render URL 입력 예정>`
- Backend: `<백엔드 Render URL 입력 예정>`
- Backend Health Check: `/health`
- 추천 API: `POST /api/phase1/recommendations`

현재 배포 상태:

- 상품 데이터: 금융감독원 API 기반 FSS 데이터 사용 가능
- AI 응답: 기본 mock 모드 유지
- 실제 OpenAI 호출: 선택적으로만 사용
- 로그인/히스토리/관리자 기능: 미구현

주의:

- 실제 API Key는 Render 환경변수로만 관리합니다.
- 프론트엔드에는 OpenAI API Key 또는 FSS API Key를 설정하지 않습니다.

## 9. Phase 2 개요

Phase 2 이름은 `FDS 의심거래 탐지 및 담당자 검토 리포트 자동화 에이전트`입니다.

Phase 2는 샘플 거래 데이터에서 의심 패턴을 탐지하고, 담당자 검토용 리포트 초안을 생성하는 업무 자동화 에이전트입니다. 금융권 FDS 업무 흐름을 포트폴리오 관점에서 표현하기 위해 룰 기반 탐지, Human-in-the-loop 검토 구조, mock 기반 AI 리포트, 비용 방어 및 외부 API 호출 통제 기준을 함께 설계했습니다.

핵심 기능:

- 샘플 거래 데이터 분석
- 룰 기반 의심거래 탐지
- `risk_score` 산정
- `low(하)`, `medium(중)`, `high(상)` 위험도 표시
- `미확인`, `검토중`, `정상거래`, `의심거래` 검토 상태 관리
- mock 리포트 조회
- 담당자 검토 UX

## 10. Phase 2 로컬 실행

백엔드:

```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

프론트엔드:

```powershell
cd frontend
npm run dev
```

접속 URL:

```text
http://127.0.0.1:3000/phase2
```

백엔드 API:

```text
http://127.0.0.1:8000/api/phase2/transactions
```

## 11. Phase 2 환경변수

Phase 2 기준 환경변수:

- `PHASE2_DATA_SOURCE=sample | real`
- `PHASE2_AI_PROVIDER=mock | openai`
- `PHASE2_DAILY_LIMIT=10`

기본 동작은 `sample + mock` 기준입니다. 현재 Step 7 기준 실제 OpenAI 호출은 비활성화되어 있으며, `PHASE2_AI_PROVIDER=openai`로 설정해도 실제 외부 호출은 수행하지 않습니다.

API Key는 프론트엔드에 노출하지 않고, 코드나 문서에 하드코딩하지 않습니다. Render 배포 시에도 실제 Secret은 코드/문서가 아니라 서비스 환경변수로만 관리합니다.

## 12. Phase 2 API 검증

거래 목록 조회:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/phase2/transactions
```

거래 분석 실행:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/api/phase2/transactions/analyze `
  -ContentType "application/json" `
  -Body '{"data_source":"sample","requested_by":"analyst-01"}'
```

mock 리포트 조회:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/phase2/transactions/tx-row-001/report |
  ConvertTo-Json -Depth 8
```

검토 상태 변경:

```powershell
Invoke-RestMethod -Method Patch `
  -Uri http://127.0.0.1:8000/api/phase2/transactions/tx-row-001/status `
  -ContentType "application/json" `
  -Body '{"review_status":"검토중","reviewed_by":"analyst-01"}'
```

## 13. Phase 2 빌드 및 검증

백엔드 컴파일:

```powershell
python -m py_compile backend/app/main.py backend/app/routes/phase2_transactions.py backend/app/services/phase2/transaction_service.py backend/app/services/phase2/detection_service.py backend/app/services/phase2/report_service.py
```

프론트엔드:

```powershell
cd frontend
npm run lint
npm run build
```

## 14. Phase 2 Render 배포 주의사항

- Render Free 티어는 비활성 상태에서 sleep이 발생할 수 있으므로 첫 요청이 느릴 수 있습니다.
- Phase 2 기본 환경변수는 `PHASE2_DATA_SOURCE=sample`, `PHASE2_AI_PROVIDER=mock`, `PHASE2_DAILY_LIMIT=10`으로 둡니다.
- 현재 Phase 2는 실제 OpenAI 호출을 수행하지 않습니다.
- 실제 API Key는 코드나 문서가 아니라 Render 서비스 환경변수로만 등록합니다.
- 배포 후 `/phase2` 화면과 `/api/phase2/transactions` API를 모두 확인합니다.
- Phase 1 화면과 API가 기존처럼 동작하는지 함께 확인합니다.
