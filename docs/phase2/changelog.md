# Phase 2 Changelog

## [v0.5] 2026-05-18

### 변경 코드: backend/app/services/phase2/report_service.py
- mock 리포트 초안의 섹션과 문장 품질을 개선했다.
- 탐지 룰별 검토 포인트, 권장 확인 액션, 한계 문구를 보강했다.

### 변경 코드: frontend/components/phase2/ReportCard.tsx
- 리포트 섹션 표시를 고도화했다.
- evidence_summary, risk_factors, recommended_actions, limitations 등 확장 필드 표시를 추가했다.

### 변경 코드: frontend/components/phase2/ReviewStatusButton.tsx
- 검토 상태 변경 UX를 보강했다.
- loading, success, error 상태 표시를 개선했다.

### 변경 코드: frontend/app/phase2/page.tsx
- 거래 선택, 상세, 리포트, 상태 변경 흐름의 화면 구성을 개선했다.

### 변경 코드: frontend/components/phase2/TransactionTable.tsx
- 거래 목록 선택 상태와 빈 데이터 표시를 개선했다.

### 변경 코드: frontend/components/phase2/RiskBadge.tsx
- 위험도 표시 fallback 처리를 보강했다.

### 변경 문서: docs/phase2/ai-policy.md
- Phase 2 AI 리포트 역할, mock/openai 기준, 비용 방어, Human-in-the-loop 원칙을 문서화했다.

### 변경 문서: changelog.md
- Phase 2 Step 5 리포트 및 검토 UX 고도화 이력을 v0.5로 기록했다.

### 변경 사유
- 실제 OpenAI 호출 전 mock 리포트 품질과 담당자 검토 화면 UX를 개선하여 포트폴리오 시연 완성도를 높이기 위함이다.

### 영향 범위
- 영향 문서: ai-policy.md, changelog.md
- 영향 기능: Phase 2 mock 리포트, 담당자 검토 화면, 상태 변경 UX
- 코드 영향: Phase 2 report service 및 Phase 2 프론트엔드 전용 컴포넌트

## [v0.4] 2026-05-18

### 변경 코드: frontend/app/phase2/page.tsx
- Phase 2 의심거래 탐지 화면을 신규 작성했다.
- 거래 분석 실행, 목록 조회, 상세 조회, 리포트 조회, 검토 상태 변경 흐름을 연결했다.

### 변경 코드: frontend/components/phase2/TransactionTable.tsx
- Phase 2 거래 목록 테이블 컴포넌트를 추가했다.

### 변경 코드: frontend/components/phase2/RiskBadge.tsx
- 위험도 low/medium/high를 하/중/상 표시 배지로 렌더링하는 컴포넌트를 추가했다.

### 변경 코드: frontend/components/phase2/ReportCard.tsx
- mock 리포트 초안을 표시하는 컴포넌트를 추가했다.

### 변경 코드: frontend/components/phase2/ReviewStatusButton.tsx
- 담당자 검토 상태 변경 컴포넌트를 추가했다.

### 변경 코드: frontend/components/PhaseNav.tsx
- Phase 2 화면으로 이동하는 탭 항목을 추가했다.

### 변경 문서: changelog.md
- Phase 2 프론트엔드 화면 연결 이력을 v0.4로 기록했다.

### 변경 사유
- Step 4 프론트 화면 연결을 통해 Phase 2 백엔드 mock API를 사용자가 화면에서 검증할 수 있도록 하기 위함이다.

### 영향 범위
- 영향 문서: changelog.md
- 영향 기능: Phase 2 프론트엔드 화면, Phase 2 API 연동
- 코드 영향: Phase 2 신규 프론트엔드 페이지 및 컴포넌트, PhaseNav 탭 추가

## [v0.3] 2026-05-18

### 변경 문서: changelog.md
- Phase 2 백엔드 mock API 구현 이력을 기록했다.

### 변경 문서: api-spec.md
- sample 외 데이터 소스 요청을 명확히 처리하기 위해 `PHASE2_INVALID_DATA_SOURCE` 에러 코드를 추가했다.

### 변경 코드: backend/app/routes/phase2_transactions.py
- Phase 2 거래 분석, 목록 조회, 상세 조회, 상태 변경, 리포트 조회 API를 추가했다.

### 변경 코드: backend/app/services/phase2/transaction_service.py
- 샘플 거래 데이터와 메모리 기반 거래 상태 관리 로직을 추가했다.

### 변경 코드: backend/app/services/phase2/detection_service.py
- HIGH_AMOUNT, NEW_DEVICE, REPEAT_TX, ODD_HOUR, LOCATION_MISMATCH 탐지 룰과 risk_score 산정 로직을 추가했다.

### 변경 코드: backend/app/services/phase2/report_service.py
- 외부 API 호출 없는 mock 리포트 생성 로직을 추가했다.

### 변경 코드: backend/app/main.py
- Phase 2 router를 등록했다.

### 변경 사유
- Step 3 백엔드 mock API 구현을 통해 Phase 2 의심거래 탐지와 담당자 검토 리포트 흐름을 API로 검증하기 위함이다.

### 영향 범위
- 영향 문서: changelog.md, api-spec.md
- 영향 기능: Phase 2 백엔드 mock API
- 코드 영향: Phase 2 신규 route/service 및 router 등록

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
