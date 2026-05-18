# Phase 2 Render Deploy Checklist

## 문서 목적

이 문서는 Phase 2 FDS 의심거래 탐지 기능을 Render Free 티어에 배포하기 전후로 확인해야 할 환경변수, API 연결, Phase 1 보호, 수동 검증 절차를 정리한다. Step 6에서는 실제 OpenAI 호출을 사용하지 않고 mock 모드 배포 검증을 기준으로 한다.

## Render Free 티어 배포 전제

- 백엔드와 프론트엔드는 Render Free 티어 배포를 전제로 점검한다.
- Render Free 티어는 비활성 상태에서 sleep이 발생할 수 있으므로 첫 요청이 느릴 수 있다.
- 현재 Step 6에서는 실제 OpenAI 호출을 사용하지 않는다.
- `PHASE2_AI_PROVIDER`는 Render에서도 `mock`을 기본으로 둔다.
- 실제 API Key는 문서나 코드가 아니라 Render 서비스 환경변수로만 등록한다.

## 백엔드 배포 점검 항목

- FastAPI 앱 진입점이 `backend.app.main:app`인지 확인한다.
- Phase 2 router가 등록되어 있는지 확인한다.
- `/api/phase2/transactions`가 인증 없이 sample 데이터를 반환하는지 확인한다.
- `/api/phase2/transactions/{id}/report`가 provider `mock` 리포트를 반환하는지 확인한다.
- 백엔드 Python 컴파일 검증을 통과했는지 확인한다.

## 프론트엔드 배포 점검 항목

- `/phase2` 라우트가 빌드 결과에 포함되는지 확인한다.
- 프론트엔드가 배포 백엔드 URL을 바라보도록 `NEXT_PUBLIC_API_BASE_URL` 설정을 확인한다.
- Phase 1 메인 페이지와 공통 AppShell이 변경되지 않았는지 확인한다.
- 거래 목록, 상세, 리포트, 상태 변경 화면이 표시되는지 확인한다.

## 환경변수 점검 항목

- `PHASE2_DATA_SOURCE=sample`
- `PHASE2_AI_PROVIDER=mock`
- `PHASE2_DAILY_LIMIT=10`
- `NEXT_PUBLIC_API_BASE_URL=https://<BACKEND_RENDER_URL>`
- Step 6에서는 실제 OpenAI API Key가 필요하지 않다.
- 실제 API Key가 필요한 후속 단계에서도 프론트엔드 환경변수로 노출하지 않는다.
- `.env`, `.env.local`, `.env.example` 파일에 배포 Secret을 기록하지 않는다.

## API 연결 점검 항목

- 백엔드 `/api/phase2/transactions`가 200 응답을 반환한다.
- 백엔드 `/api/phase2/transactions/analyze` POST가 sample 데이터 분석 결과를 반환한다.
- 백엔드 `/api/phase2/transactions/{id}/report`가 `provider=mock`을 반환한다.
- 프론트엔드 `/phase2`에서 거래 목록이 표시된다.
- 프론트엔드에서 거래 분석 실행, 거래 선택, 리포트 조회, 상태 변경이 동작한다.

## Phase 1 보호 점검 항목

- `/` Phase 1 메인 페이지가 기존처럼 접근 가능해야 한다.
- Phase 1 추천 API path와 응답 형식이 변경되지 않아야 한다.
- Phase 1 `OPENAI_DAILY_LIMIT`와 Phase 2 `PHASE2_DAILY_LIMIT`를 혼용하지 않아야 한다.
- Phase 2 배포 환경변수 추가가 Phase 1 동작에 영향을 주지 않아야 한다.

## Phase 2 기능 점검 항목

- 거래 목록 조회가 가능하다.
- 거래 분석 실행 후 요약이 표시된다.
- 위험도 `low`, `medium`, `high`가 화면에서 `하`, `중`, `상`으로 표시된다.
- 검토 상태 `미확인`, `검토중`, `정상거래`, `의심거래` 변경이 가능하다.
- mock 리포트에 탐지 근거, 위험 요인, 권장 액션, 한계 문구, disclaimer가 표시된다.
- AI가 거래 차단 또는 최종 상태 변경을 자동 수행하지 않는다.

## 배포 후 수동 검증 명령

```powershell
Invoke-RestMethod https://<BACKEND_RENDER_URL>/api/phase2/transactions

Invoke-RestMethod -Method Post `
  -Uri https://<BACKEND_RENDER_URL>/api/phase2/transactions/analyze `
  -ContentType "application/json" `
  -Body '{"data_source":"sample","requested_by":"analyst-01"}'

Invoke-RestMethod https://<BACKEND_RENDER_URL>/api/phase2/transactions/tx-row-001/report |
  ConvertTo-Json -Depth 8
```

프론트엔드 검증:

```text
https://<FRONTEND_RENDER_URL>/phase2
```

Phase 1 검증:

```text
https://<FRONTEND_RENDER_URL>/
```

## 알려진 주의사항

- Render Free 티어는 cold start로 첫 요청이 느릴 수 있다.
- 백엔드가 sleep 상태면 프론트엔드 최초 API 요청이 지연될 수 있다.
- 현재 Step 6에서는 openai 모드 실제 호출이 미활성화되어 있다.
- `PHASE2_AI_PROVIDER=openai`가 설정되어도 외부 API 호출 없이 mock 리포트를 반환해야 한다.
- CORS 또는 `NEXT_PUBLIC_API_BASE_URL` 설정 오류가 있으면 프론트엔드에서 API 연결 실패가 발생할 수 있다.

## 배포 오류 기록

### 발생 일시
- YYYY-MM-DD HH:mm

### 발생 위치
- Backend / Frontend / Environment / Routing / API

### 문제
-

### 원인
-

### 해결
-

### 재발 방지
-
