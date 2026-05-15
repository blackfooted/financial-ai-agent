# Phase 1 Backend

## 실행 목적

금융 상품 비교 추천 AI 에이전트 Phase 1 백엔드입니다.

## 가상환경 안내

리팩토링 전 사용하던 `backend/phase1/.venv`는 새 구조에서 재사용하지 않습니다.

새 구조에서는 `backend/` 위치에서 가상환경을 다시 생성합니다.

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Mac/Linux

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

주의:

- 기존 `.venv`는 Git 추적 대상이 아니므로 이동하지 않습니다.
- 새 구조에서 실행할 때는 `backend/.venv`를 사용합니다.

## 실행 방법

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Mac/Linux

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 확인 방법

```bash
curl http://127.0.0.1:8000/health
```

예상 응답:

```json
{
  "status": "ok",
  "service": "financial-ai-agent-phase1"
}
```

## 현재 구현 범위

- FastAPI 앱 기본 구조
- `/health` 엔드포인트
- 환경변수 로딩 기준
- 추천 API mock 구현

## 추천 API mock 검증

아래 명령은 `backend` 경로에서 서버를 실행한 뒤 다른 터미널에서 실행합니다.

### Windows PowerShell

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/phase1/recommendations" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"product_type":"saving","age":29,"amount":500000,"saving_period_months":12,"financial_goal":"lump_sum","preferred_institutions":["bank"]}'
```

### Mac/Linux

```bash
curl -X POST http://127.0.0.1:8000/api/phase1/recommendations \
  -H "Content-Type: application/json" \
  -d '{"product_type":"saving","age":29,"amount":500000,"saving_period_months":12,"financial_goal":"lump_sum","preferred_institutions":["bank"]}'
```

## 금융감독원 API 연동 준비

현재 상태:

- `backend/app/services/fss_client.py` 추가
- 예금/적금 상품 조회 함수 인터페이스 준비
- 실제 추천 API 기본 흐름은 아직 `sample_products.json` mock 데이터를 사용
- `FSS_API_KEY`가 없으면 실제 API 호출은 불가
- 대출 상품 실제 API 연동은 후속 작업

환경변수:

```env
FSS_API_KEY=
```

주의:

- 실제 API Key는 `.env` 또는 Render 환경변수에만 설정하고 Git에 커밋하지 않습니다.
- 추천 API 기본 흐름은 아직 FSS API를 호출하지 않습니다.

### FSS API 단독 테스트

`FSS_API_KEY`가 설정된 환경에서만 실행합니다.

```bash
python app/services/fss_client.py
```

이 테스트는 추천 API 기본 흐름과 별개입니다.

## 상품 데이터 소스 전환

기본값은 `sample`입니다.

```env
PRODUCT_DATA_SOURCE=sample
```

FSS API를 사용하려면 아래처럼 설정합니다.

```env
PRODUCT_DATA_SOURCE=fss
FSS_API_KEY=발급받은_키
```

주의:

- `PRODUCT_DATA_SOURCE=fss`일 때 `FSS_API_KEY`가 없으면 추천 API는 `FINANCIAL_API_ERROR`를 반환합니다.
- FSS 응답은 24시간 파일 캐시를 사용합니다.
- Render Free 티어에서는 인스턴스 재시작 시 파일 캐시가 초기화될 수 있습니다.
- 재시작 후 첫 FSS 요청은 실시간 호출이 발생할 수 있습니다.
- Phase 1에서는 이 한계를 허용하고, 필요 시 Phase 2 이후 Redis 등 외부 캐시 도입을 검토합니다.
- 현재 FSS 실제 연동은 은행권 예금/적금 중심입니다.
- 저축은행과 대출 실제 연동은 후속 작업입니다.
## AI Provider 전환

기본값은 mock입니다.

```env
AI_PROVIDER=mock
```

실제 OpenAI API를 사용하려면 서버 환경변수에 아래처럼 설정합니다.

```env
AI_PROVIDER=openai
OPENAI_API_KEY=발급받은_키
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_SECONDS=20
OPENAI_MAX_RETRIES=1
```

주의:

- `AI_PROVIDER=openai`일 때만 실제 OpenAI API를 호출합니다.
- `OPENAI_API_KEY`가 없거나 OpenAI 호출에 실패하면 추천 API는 `partial_success`로 응답합니다.
- 상품 목록은 유지되지만 AI 추천 설명은 비어 있을 수 있습니다.
- API Key는 `.env` 또는 Render 환경변수에만 설정하고 Git에 커밋하지 않습니다.
- 프론트엔드에는 OpenAI API Key를 절대 설정하지 않습니다.

### OpenAI 일일 호출 제한

`AI_PROVIDER=openai`일 때 추천 API에는 일일 호출 제한이 적용됩니다.

```env
OPENAI_DAILY_LIMIT=10
```

기준:

- 제한 대상: `POST /api/phase1/recommendations`
- 제한 비대상: 프론트엔드 화면 접속, GNB 클릭, 입력값 변경, `/health`
- `AI_PROVIDER=mock`에서는 제한을 차감하지 않음
- quota 초과 시 HTTP 429 반환

Phase 1에서는 파일 기반 카운터를 사용합니다. Render Free 티어에서는 인스턴스 재시작 시 카운터가 초기화될 수 있으므로, 운영 단계에서는 Redis 또는 DB 기반 제한을 검토합니다.
