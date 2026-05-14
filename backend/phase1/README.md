# Phase 1 Backend

## 실행 목적

금융 상품 비교 추천 AI 에이전트 Phase 1 백엔드입니다.

## 실행 방법

### Windows PowerShell

```powershell
cd backend/phase1
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Mac/Linux

```bash
cd backend/phase1
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
- 추천 API는 후속 단계에서 구현
