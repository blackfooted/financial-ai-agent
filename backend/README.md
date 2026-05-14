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
