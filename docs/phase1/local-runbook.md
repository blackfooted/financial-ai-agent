# Phase 1 로컬 실행 및 검증 가이드

## 1. 문서 목적

본 문서는 Phase 1 로컬 개발 환경에서 백엔드와 프론트엔드를 함께 실행하고 검증하는 방법을 정의한다.

백엔드 mock 추천 API가 프론트엔드 추천 화면과 연결되는지 확인하는 기준을 제공한다.

Render 배포 전 로컬에서 확인해야 할 항목도 함께 정리한다.

## 2. 현재 구현 범위

| 구분 | 구현 상태 |
| --- | --- |
| 백엔드 FastAPI 기본 구조 | 완료 |
| `/health` API | 완료 |
| `POST /api/phase1/recommendations` mock API | 완료 |
| 샘플 금융상품 데이터 | 완료 |
| `shared/openai_client.py` mock | 완료 |
| 프론트엔드 Next.js App Router | 완료 |
| GNB 기반 추천 화면 | 완료 |
| 추천 결과 표시 | 완료 |
| 로딩/오류/부분 성공 상태 | 완료 |
| 실제 OpenAI API 호출 | 미구현 |
| 실제 금융감독원 API 호출 | 미구현 |
| 로그인/히스토리/관리자 기능 | 제외 |

## 3. 사전 준비

필수 도구:

| 도구 | 기준 |
| --- | --- |
| Python | 3.11 이상 권장 |
| Node.js | 20.9 이상 |
| npm | Node.js와 함께 설치 |
| Git | 설치 필요 |

확인 명령:

```bash
python --version
node --version
npm --version
git --version
```

백엔드 환경변수 예시:

```env
APP_ENV=local
LOG_LEVEL=INFO
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
FSS_API_KEY=
ALLOWED_ORIGINS=
```

프론트엔드 환경변수 예시:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

주의:

- `.env`, `.env.local`은 Git에 커밋하지 않는다.
- 로컬 mock 검증 단계에서는 실제 API Key가 없어도 `/health`와 mock 추천 API 검증이 가능하다.

## 4. 백엔드 실행 방법

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Mac/Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

정상 실행 기준:

```text
Uvicorn running on http://127.0.0.1:8000
```

`/health` 확인:

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

## 5. 프론트엔드 실행 방법

```bash
cd frontend
npm install
npm run dev
```

정상 실행 기준:

```text
Local: http://localhost:3000
```

브라우저 접속:

```text
http://localhost:3000
```

주의:

- 추천 API 호출을 확인하려면 백엔드가 먼저 실행되어 있어야 한다.
- 프론트엔드의 `NEXT_PUBLIC_API_BASE_URL` 기본값은 `http://localhost:8000`이다.
- `.env.local`이 없어도 기본값으로 로컬 백엔드 호출이 가능해야 한다.

## 6. End-to-End 검증 시나리오

### 시나리오 1: 적금 추천 기본 흐름

입력값:

| 항목 | 값 |
| --- | --- |
| 상품 유형 | 적금 |
| 나이 | 29 |
| 금액 | 500000 |
| 기간 | 12개월 |
| 금융 목적 | 목돈 마련 |
| 선호 금융권역 | 은행 |

검증 기준:

- [ ] 추천 버튼 클릭 가능
- [ ] 로딩 중 버튼 비활성화
- [ ] 추천 API 호출 발생
- [ ] 추천 결과 카드 표시
- [ ] 추천 요약 표시
- [ ] 상품명, 금융회사명, 금리, 기간 표시
- [ ] 추천 사유 표시
- [ ] 유의사항 표시
- [ ] 면책 문구 표시

### 시나리오 2: 예금 추천

입력값:

| 항목 | 값 |
| --- | --- |
| 상품 유형 | 예금 |
| 나이 | 35 |
| 금액 | 10000000 |
| 기간 | 12개월 |
| 금융 목적 | 여유자금 예치 |
| 선호 금융권역 | 은행 |

검증 기준:

- [ ] 예금 상품만 표시
- [ ] 추천 결과 카드 표시
- [ ] 금리 기준 정보 표시

### 시나리오 3: 대출 추천

입력값:

| 항목 | 값 |
| --- | --- |
| 상품 유형 | 대출 |
| 나이 | 40 |
| 금액 | 20000000 |
| 기간 | 36개월 |
| 금융 목적 | 생활자금 |
| 선호 금융권역 | 전체 |

검증 기준:

- [ ] 대출 상품 표시
- [ ] 대출 승인 여부, 한도, 개인별 금리를 단정하지 않는 유의사항 표시
- [ ] 금융 자문이 아닌 참고용 문구 표시

## 7. API 직접 검증

PowerShell 예시:

```powershell
$body = @{
  product_type = "saving"
  age = 29
  amount = 500000
  saving_period_months = 12
  financial_goal = "lump_sum"
  preferred_institutions = @("bank")
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/phase1/recommendations" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

curl 예시:

```bash
curl -X POST http://127.0.0.1:8000/api/phase1/recommendations \
  -H "Content-Type: application/json" \
  -d '{"product_type":"saving","age":29,"amount":500000,"saving_period_months":12,"financial_goal":"lump_sum","preferred_institutions":["bank"]}'
```

## 8. 정상 응답 기준

```json
{
  "request_id": "rec_...",
  "product_type": "saving",
  "status": "success",
  "summary": "...",
  "recommended_products": [],
  "comparison_points": [],
  "disclaimer": "...",
  "source": {
    "provider": "sample",
    "cache_used": true
  },
  "error": null
}
```

정상 기준:

- [ ] `status`가 `success` 또는 `partial_success`
- [ ] `recommended_products`가 배열
- [ ] `disclaimer`가 존재
- [ ] `source.provider`가 `sample`
- [ ] 실제 OpenAI/FSS API 호출 없음

## 9. 오류 상황별 확인 방법

| 상황 | 확인 방법 | 대응 |
| --- | --- | --- |
| 프론트엔드 추천 API 연결 실패 | 백엔드 서버 실행 여부 확인 | `uvicorn app.main:app` 실행 |
| CORS 오류 | 백엔드 CORS origin 확인 | `localhost:3000` 포함 여부 확인 |
| 404 응답 | 요청 URL 경로 확인 | `/api/phase1/recommendations` 경로 확인 |
| 422 응답 | 요청 Body 필드 확인 | enum 값, 숫자 값 확인 |
| 프론트엔드 3000 접속 실패 | Next dev server 확인 | `npm run dev` 재실행 |
| 백엔드 8000 포트 사용 중 | 프로세스 확인 | 기존 프로세스 종료 또는 포트 변경 |
| npm 취약점 경고 | `npm audit` 결과 확인 | 별도 보안 점검 작업으로 분리 |

## 10. 현재 Known Issues

| 항목 | 내용 | 처리 방향 |
| --- | --- | --- |
| npm moderate 취약점 | `npm install` 과정에서 moderate 취약점이 보고될 수 있음 | 현재 단계에서는 자동 수정하지 않음. 별도 의존성 점검 작업으로 분리 |
| 실제 API 미연동 | OpenAI API와 금융감독원 API를 아직 실제 호출하지 않음 | mock 검증 완료 후 후속 단계에서 연동 |
| 저축은행 `topFinGrpNo` | 공식 API 상세 또는 실제 호출 테스트 전까지 `SAVINGS_BANK_TBD` 사용 | 금융 API 연동 단계에서 확정 |
| `request_id` 중복 가능성 | 초 단위 생성 방식으로 동일 초 요청 시 중복 가능 | Phase 1에서는 DB 저장이 없으므로 허용. Phase 2 이후 UUID 검토 |

## 11. 배포 전 확인 사항

- [ ] 백엔드 `requirements.txt` 확정
- [ ] 프론트엔드 `package-lock.json` 포함 여부 확인
- [ ] `.env` / `.env.local` Git 제외 확인
- [ ] Render 환경변수 설정 항목 정리
- [ ] 백엔드 CORS `ALLOWED_ORIGINS` 설정
- [ ] 프론트엔드 `NEXT_PUBLIC_API_BASE_URL` 설정
- [ ] 실제 OpenAI API 호출 여부 결정
- [ ] 실제 금융감독원 API 호출 여부 결정
- [ ] `npm audit` 결과 검토
- [ ] README 실행 방법 최신화

## 12. 다음 작업 후보

1. 프론트엔드 UI 추가 개선
2. 추천 결과 표시 문구 정리
3. Render 배포 설정 점검
4. npm audit 취약점 검토
5. 실제 금융감독원 API 연동 준비
6. 실제 OpenAI API 연동 준비

## Render 배포 후 CORS 확인 보완

| 상황 | 확인 방법 | 대응 |
| --- | --- | --- |
| Render 배포 후 추천 API 연결 실패 | 브라우저 Network 탭에서 Request URL과 CORS 오류 확인 | Frontend `NEXT_PUBLIC_API_BASE_URL`, Backend `ALLOWED_ORIGINS` 값 확인 |
| Backend 기본 URL이 `{"detail":"Not Found"}` 표시 | `/health` 경로로 접속 | `/`는 라우트가 없으므로 `/health`로 정상 여부 확인 |

Render 배포 환경에서는 프론트엔드와 백엔드 URL이 서로 다르므로 CORS 설정이 필요하다.

- Frontend `NEXT_PUBLIC_API_BASE_URL`: Backend Render URL
- Backend `ALLOWED_ORIGINS`: Frontend Render URL

두 값을 서로 반대로 입력하지 않도록 주의한다.
