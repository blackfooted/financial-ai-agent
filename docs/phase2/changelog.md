# Phase 2 Changelog

## [v0.2] 2026-05-18

### 변경 문서: PRD.md
- 검토 상태값을 미확인, 검토중, 정상거래, 의심거래로 정리했다.
- 위험도 표현을 low(하), medium(중), high(상) 기준으로 정리했다.
- 처리 이력 관리 우선순위를 High로 조정했다.
- Phase 2에서는 로그인/인증을 제외하고 담당자 식별자를 요청 파라미터로 전달하는 기준을 명시했다.

### 변경 문서: data-definition.md
- 탐지 룰 코드 정의를 추가했다.
- risk_score 산정 기준과 위험도 매핑 기준을 추가했다.
- 검토 상태값과 위험도 표현을 Phase 2 기준으로 정리했다.

### 변경 문서: api-spec.md
- 에러 코드 목록을 추가했다.
- PATCH 상태 변경 API의 상태 전이 규칙을 명시했다.
- API 예시의 상태값과 위험도 값을 Phase 2 기준으로 정리했다.

### 변경 문서: detection-rules.md
- Phase 2 탐지 룰 정의 문서를 신규 작성했다.
- HIGH_AMOUNT, NEW_DEVICE, REPEAT_TX, ODD_HOUR, LOCATION_MISMATCH 룰을 정의했다.
- risk_score 산정 기준과 룰 조합 예시를 정리했다.

### 변경 문서: sample-data-spec.md
- Phase 2 샘플 거래 데이터 설계 문서를 신규 작성했다.
- 정상 거래와 의심 거래 케이스, 기대 탐지 결과를 정리했다.

### 변경 문서: changelog.md
- Phase 2 Step 2 문서 작성 및 기존 문서 보완 이력을 v0.2로 기록했다.

### 변경 사유
- Step 3 백엔드 mock API 구현 전 탐지 룰, 샘플 데이터, 상태값, 위험도, 에러 코드 기준을 명확히 하기 위함이다.

### 영향 범위
- 영향 문서: PRD.md, data-definition.md, api-spec.md, detection-rules.md, sample-data-spec.md, changelog.md
- 영향 기능: Phase 2 룰 기반 의심거래 탐지, 위험도 산정, 검토 상태 관리, 리포트 조회 API 설계
- 코드 영향: 없음

## [v0.1] 2026-05-18

### 변경 문서: PRD.md
- Phase 2 프로젝트 개요, 목표, 사용자 시나리오, 기능 범위, 제외 범위를 신규 작성했다.
- 요구사항 정의서 표를 추가하고 샘플 거래 조회, 분석 요청, 룰 기반 탐지, 위험도 산정, 담당자 검토, AI 리포트, 비용 방어, Human-in-the-loop 원칙을 정리했다.

### 변경 문서: data-definition.md
- 샘플 거래 데이터 설계 원칙과 거래 데이터 필드 정의를 신규 작성했다.
- 탐지 결과 필드, 위험도 기준, 검토 상태, 샘플 데이터 시나리오, real 데이터 확장 고려사항을 정리했다.

### 변경 문서: api-spec.md
- Phase 2 확정 API Path 5개를 문서화했다.
- API별 Request / Response 예시, 공통 응답 원칙, 에러 응답 예시, mock 모드 기준, openai 모드 비용 방어 기준을 정리했다.
- `PHASE2_DATA_SOURCE`, `PHASE2_AI_PROVIDER`, `PHASE2_DAILY_LIMIT` 환경변수를 문서화했다.

### 변경 문서: changelog.md
- Phase 2 초기 기획 문서 작성 이력을 v0.1로 기록했다.

### 변경 사유
- Phase 2 개발 착수 전 요구사항, 데이터 구조, API 계약, 변경 이력을 명확히 정의하기 위해 초기 기획 산출물을 작성했다.

### 영향 범위
- 영향 문서: PRD.md, data-definition.md, api-spec.md, changelog.md
- 영향 기능: Phase 2 의심거래 탐지 및 담당자 검토 리포트 자동화 기획 기준
- 코드 영향: 없음

