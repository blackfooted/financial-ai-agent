# Phase 2 API 명세서

## 문서 목적

본 문서는 Phase 2 "FDS 의심거래 탐지 및 담당자 검토 리포트 자동화 에이전트"의 API 설계 원칙, 확정 API Path, 요청 및 응답 예시, mock 모드 기준, openai 모드 비용 방어 기준을 정의한다. 개발 전 백엔드와 프론트엔드가 동일한 계약을 기준으로 작업할 수 있도록 한다.

## API 설계 원칙

- AI가 거래를 직접 차단하지 않는다.
- 룰 기반 탐지 후보를 만든 뒤 AI는 담당자 검토용 리포트 초안만 생성한다.
- 최종 판단은 담당자가 수행한다.
- mock이 기본값이다.
- 실제 OpenAI 호출은 사용자의 명시적 승인 후에만 수행한다.
- API Key는 프론트엔드에 노출하지 않는다.
- API Key를 코드 또는 문서에 하드코딩하지 않는다.
- API와 데이터 필드의 `risk_level` 값은 `low`, `medium`, `high`를 사용한다.
- 화면 표시명은 `low(하)`, `medium(중)`, `high(상)`으로 병기한다.

## Phase 2 환경변수

- `PHASE2_DATA_SOURCE=sample | real`
- `PHASE2_AI_PROVIDER=mock | openai`
- `PHASE2_DAILY_LIMIT=10`

| 환경변수 | 기본값 | 허용값 | 설명 |
|---|---|---|---|
| PHASE2_DATA_SOURCE | sample | sample, real | Phase 2 거래 데이터 소스를 결정한다. |
| PHASE2_AI_PROVIDER | mock | mock, openai | AI 리포트 생성 방식을 결정한다. mock이 기본값이다. |
| PHASE2_DAILY_LIMIT | 10 | positive integer | openai 모드에서 하루 최대 AI 호출 횟수를 제한한다. |

## 공통 응답 원칙

- 성공 응답은 `success`, `data`, `message`를 포함한다.
- 실패 응답은 `success=false`, `error.code`, `error.message`를 포함한다.
- 목록 응답은 필요한 경우 `meta.total`, `meta.page`, `meta.page_size`를 포함할 수 있다.
- 상태값과 필드명은 문서에 정의된 값을 그대로 사용한다.

### 성공 응답 기본 형태

```json
{
  "success": true,
  "data": {},
  "message": "요청이 정상 처리되었습니다."
}
```

### 에러 응답 예시

```json
{
  "success": false,
  "error": {
    "code": "PHASE2_TRANSACTION_NOT_FOUND",
    "message": "요청한 거래를 찾을 수 없습니다."
  }
}
```

## 에러 코드

| 에러 코드 | 상황 |
|---|---|
| PHASE2_TRANSACTION_NOT_FOUND | 요청한 거래 ID가 존재하지 않는 경우 |
| PHASE2_DAILY_LIMIT_EXCEEDED | openai 모드에서 일일 호출 한도를 초과한 경우 |
| PHASE2_INVALID_STATUS | 허용되지 않는 review_status 값이 전달된 경우 |
| PHASE2_REPORT_NOT_READY | 리포트 생성 전 조회를 시도한 경우 |

## API 목록

| Method | Path | 설명 |
|---|---|---|
| POST | /api/phase2/transactions/analyze | 샘플 거래 데이터 분석을 요청한다. |
| GET | /api/phase2/transactions | 거래 목록과 탐지 결과 요약을 조회한다. |
| GET | /api/phase2/transactions/{id} | 특정 거래 상세와 탐지 결과를 조회한다. |
| PATCH | /api/phase2/transactions/{id}/status | 특정 거래의 담당자 검토 상태를 변경한다. |
| GET | /api/phase2/transactions/{id}/report | 특정 거래의 담당자 검토용 리포트 초안을 조회한다. |

## POST /api/phase2/transactions/analyze

샘플 거래 데이터에 대해 룰 기반 의심거래 탐지를 수행하고, 필요한 경우 리포트 초안 생성을 준비한다. Phase 2에서는 로그인/인증을 구현하지 않으므로 담당자 식별자는 `requested_by` 요청 값으로 전달한다.

### Request 예시

```json
{
  "data_source": "sample",
  "requested_by": "analyst-01"
}
```

### Response 예시

```json
{
  "success": true,
  "data": {
    "analysis_id": "analysis-20260518-001",
    "total_count": 20,
    "detected_count": 8,
    "risk_summary": {
      "low": 4,
      "medium": 3,
      "high": 1
    },
    "display_labels": {
      "low": "하",
      "medium": "중",
      "high": "상"
    }
  },
  "message": "거래 데이터 분석이 완료되었습니다."
}
```

## GET /api/phase2/transactions

거래 목록과 탐지 결과 요약을 조회한다.

### Request 예시

```text
GET /api/phase2/transactions?risk_level=high&review_status=미확인
```

### Response 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "tx-row-001",
      "transaction_id": "TX202605180001",
      "customer_id": "CUST-1001",
      "amount": 3500000,
      "currency": "KRW",
      "channel": "mobile",
      "transaction_time": "2026-05-18T09:30:00+09:00",
      "risk_level": "high",
      "risk_label": "상",
      "risk_score": 90,
      "review_status": "미확인"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "page_size": 20
  },
  "message": "거래 목록을 조회했습니다."
}
```

## GET /api/phase2/transactions/{id}

특정 거래의 상세 정보와 탐지 결과를 조회한다.

### Request 예시

```text
GET /api/phase2/transactions/tx-row-001
```

### Response 예시

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx-row-001",
      "transaction_id": "TX202605180001",
      "customer_id": "CUST-1001",
      "account_id": "ACC-2001",
      "transaction_type": "transfer",
      "amount": 3500000,
      "currency": "KRW",
      "channel": "mobile",
      "device_id": "DEV-SEOUL-01",
      "ip_address": "192.0.2.10",
      "location": "Seoul",
      "transaction_time": "2026-05-18T09:30:00+09:00",
      "created_at": "2026-05-18T09:31:00+09:00"
    },
    "detection": {
      "id": "det-001",
      "transaction_id": "TX202605180001",
      "detected_rules": ["HIGH_AMOUNT", "NEW_DEVICE", "LOCATION_MISMATCH"],
      "risk_level": "high",
      "risk_label": "상",
      "risk_score": 90,
      "reason_summary": "고액 이체, 신규 기기, 위치 불일치가 함께 확인됨",
      "review_status": "미확인",
      "reviewed_by": null,
      "reviewed_at": null,
      "created_at": "2026-05-18T09:32:00+09:00",
      "updated_at": "2026-05-18T09:32:00+09:00"
    }
  },
  "message": "거래 상세를 조회했습니다."
}
```

## PATCH /api/phase2/transactions/{id}/status

특정 거래의 담당자 검토 상태를 변경한다. 허용 상태값은 `미확인`, `검토중`, `정상거래`, `의심거래`이다.

### 상태 전이 규칙

- Phase 2 포트폴리오 범위에서는 모든 상태 간 전이를 허용한다.
- 상태 변경 시 `reviewed_by`, `reviewed_at`, `updated_at`은 갱신한다.
- 실제 운영계에서는 상태 역전이 제한, 권한 검증, 감사 로그가 필요하지만 Phase 2 범위에서는 제외한다.

### Request 예시

```json
{
  "review_status": "검토중",
  "reviewed_by": "analyst-01"
}
```

### Response 예시

```json
{
  "success": true,
  "data": {
    "id": "det-001",
    "transaction_id": "TX202605180001",
    "review_status": "검토중",
    "reviewed_by": "analyst-01",
    "reviewed_at": "2026-05-18T10:10:00+09:00",
    "updated_at": "2026-05-18T10:10:00+09:00"
  },
  "message": "검토 상태가 변경되었습니다."
}
```

## GET /api/phase2/transactions/{id}/report

특정 거래의 담당자 검토용 리포트 초안을 조회한다. AI 리포트는 최종 판단이 아니라 담당자 검토를 보조하는 설명 자료이다.

### Request 예시

```text
GET /api/phase2/transactions/tx-row-001/report
```

### Response 예시

```json
{
  "success": true,
  "data": {
    "transaction_id": "TX202605180001",
    "provider": "mock",
    "report_title": "의심거래 검토 리포트 초안",
    "risk_level": "high",
    "risk_label": "상",
    "summary": "해당 거래는 고액 이체, 신규 기기, 위치 불일치가 동시에 확인되어 우선 검토가 필요합니다.",
    "detected_rules": ["HIGH_AMOUNT", "NEW_DEVICE", "LOCATION_MISMATCH"],
    "review_points": [
      "최근 동일 고객의 거래 금액 패턴과 비교가 필요합니다.",
      "신규 기기 등록 또는 본인 사용 여부 확인이 필요합니다.",
      "거래 발생 위치와 직전 거래 위치의 정합성 확인이 필요합니다."
    ],
    "disclaimer": "본 리포트는 담당자 검토를 위한 초안이며, 최종 판단은 담당자가 수행합니다."
  },
  "message": "리포트 초안을 조회했습니다."
}
```

## mock 모드 동작 기준

- `PHASE2_AI_PROVIDER=mock`이 기본값이다.
- mock 모드에서는 외부 API를 호출하지 않는다.
- mock 리포트는 탐지 룰, 위험도, 거래 요약을 기반으로 정해진 템플릿 형태로 생성한다.
- mock 모드는 개발, 포트폴리오 시연, 비용 없는 기능 검증을 위한 기본 경로로 사용한다.

## openai 모드 전환 시 비용 방어 기준

- 실제 OpenAI 호출은 사용자의 명시적 승인 후에만 수행한다.
- `PHASE2_DAILY_LIMIT=10` 기준으로 일일 호출 횟수를 제한한다.
- 리포트 생성에 필요한 최소 거래 필드와 탐지 결과만 AI 입력으로 전달한다.
- API Key는 서버 환경변수로만 관리하며, 프론트엔드 응답 또는 문서 예시에 포함하지 않는다.
- 실패 시 동일 요청을 무제한 재시도하지 않고, 담당자가 재요청 여부를 판단할 수 있도록 에러를 반환한다.
- AI 응답은 담당자 검토용 초안으로만 사용하며, 거래 차단 또는 `의심거래` 상태 변경을 자동 수행하지 않는다.

