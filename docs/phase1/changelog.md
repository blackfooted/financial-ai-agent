# changelog.md

## 버전 관리 기준

- changelog 버전은 프로젝트 전체 문서 변경 단위 기준으로 관리한다.
- 개별 문서별 버전이 아니라, Phase 1 문서 세트의 변경 이력을 순차 기록한다.
- 동일 날짜에 여러 문서를 수정하더라도 작업 단위가 다르면 버전을 분리할 수 있다.

## [v0.7] 2026-05-13

### 변경 문서: api-spec.md, changelog.md

- Phase 1 API 명세 초안 작성
- `POST /api/phase1/recommendations` 단일 추천 API 요청/응답 구조 정의
- `request_id` 백엔드 생성 기준 정의
- `amount` 필드의 상품 유형별 의미 정의
- 추천 성공, 부분 성공, 오류 응답 구조 정의
- `partial_success` 반환 조건 정의
- 상품 유형별 처리 기준 정의
- AI 응답 처리 기준과 금지 표현 기준 요약
- 캐시 및 외부 API 호출 기준 정리
- 환경변수 및 보안 기준 정리
- Phase 1 제외 API 목록 정리

### 변경 사유

- 백엔드 구현 전 추천 API의 요청/응답 계약을 명확히 하기 위함
- Render Free 티어와 MVP 범위를 고려해 API 구조를 단순화하기 위함
- 프론트엔드와 백엔드가 동일한 응답 상태 기준을 사용하도록 하기 위함
- 구현 시 혼선을 줄이기 위해 `request_id`, `amount`, `partial_success` 처리 기준을 명확히 하기 위함

### 영향 범위

- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 추천 API 구현
- Phase 1 프론트엔드 추천 요청 및 결과 표시 구현

## [v0.6] 2026-05-13

### 변경 문서: IA.md, changelog.md

- Phase 1 IA 초안 작성
- 폼 입력 기반 단일 페이지 추천 화면 구조 정의
- 추천 조건 입력 영역, 추천 실행 영역, 추천 결과 영역 정의
- 오류/빈 결과/로딩 상태별 화면 처리 기준 정의
- PC와 모바일 화면 배치 기준 정의
- Phase 1 제외 화면 정리

### 변경 사유

- flow.md에서 정의한 사용자 흐름과 시스템 흐름을 실제 화면 구조로 구체화하기 위함
- api-spec.md와 data-definition.md 작성 전 입력 항목과 결과 표시 구조를 확정하기 위함
- 프론트엔드 구현 전 화면 상태와 영역별 책임을 명확히 하기 위함

### 영향 범위

- docs/phase1/api-spec.md
- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 프론트엔드 화면 구현
- Phase 1 추천 API 요청/응답 구조

## [v0.5] 2026-05-13

### 변경 문서: README.md, PRD.md, changelog.md

- PRD.md에서 포트폴리오 목표와 평가자 관점 내용을 제거
- PRD.md를 실제 제품 요구사항 중심 문서로 정리
- 루트 README.md에 프로젝트 개요, 포트폴리오 목표, 기술 스택, 문서 목록, 면책 문구 추가
- 문서 역할을 README와 Phase 1 기획 문서로 분리

### 변경 사유

- PRD.md의 문서 성격을 제품 요구사항 정의서로 유지하기 위함
- 포트폴리오 목적과 평가자 관점 내용은 README.md에서 다루는 것이 적절하기 때문
- 이후 IA, API 명세, 데이터 정의 작성 시 제품 기능 기준이 흔들리지 않도록 하기 위함

### 영향 범위

- docs/phase1/PRD.md
- docs/phase1/IA.md
- docs/phase1/api-spec.md
- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- README.md

## [v0.3] 2026-05-13

### 변경 문서: PRD.md, scenario.md, changelog.md

- Phase 1 UX를 폼 입력 기반 추천과 대화형 설명 방식으로 명확화
- 포트폴리오 평가자 항목 제거
- 핵심 입력 항목에 입력 방식 추가
- 추천 API를 `POST /api/phase1/recommendations` 단일 구조로 정리
- PRD 미정 사항에 권장 방향과 결정 시한 추가
- scenario.md에 입력 방식, 재입력/수정, 로딩/응답 대기 시나리오 추가
- 대출 단정 표현 방지 상세 정책은 `ai-policy.md`로 위임
- changelog 버전 관리 기준 추가

### 변경 사유

- PRD와 scenario 간 챗봇/폼 입력 방식의 정합성을 맞추기 위함
- API 구조를 Render Free 티어와 MVP 구현 범위에 맞게 단순화하기 위함
- 기능 설계 문서에서 실제 사용자와 포트폴리오 평가자를 분리하기 위함
- 이후 flow.md, IA.md, api-spec.md 작성 전 결정 기준을 명확히 하기 위함

### 영향 범위

- docs/phase1/flow.md
- docs/phase1/IA.md
- docs/phase1/api-spec.md
- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 추천 API 설계
- Phase 1 프론트엔드 입력/결과 화면 설계

## [v0.2] 2026-05-13

### 변경 문서: scenario.md

- 금융 상품 비교 추천 AI 에이전트 Phase 1 사용자 시나리오 초안 작성
- 적금, 예금, 대출 상품 탐색 대표 시나리오 정의
- 필수 입력값 누락, 금융 API 실패, 추천 결과 없음, OpenAI 호출 실패 예외 시나리오 정의
- AI 응답 시나리오와 금지 표현 기준 정리
- 사용자 여정 요약 및 Phase 1 시나리오 우선순위 정리

### 변경 사유

- PRD.md의 요구사항을 실제 사용자 흐름 기준으로 구체화하기 위함
- 이후 flow.md, IA.md, api-spec.md, data-definition.md, ai-policy.md 작성 기준을 마련하기 위함
- 금융상품 추천 서비스에서 정상 흐름뿐 아니라 예외 상황과 AI 제약 조건을 초기 단계에서 명확히 하기 위함

### 영향 범위

- docs/phase1/flow.md
- docs/phase1/IA.md
- docs/phase1/api-spec.md
- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 추천 API 설계
- Phase 1 프론트엔드 입력 및 결과 화면 설계

## [v0.1] 2026-05-13

### 변경 문서: PRD.md

- 금융 상품 비교 추천 AI 에이전트 Phase 1 PRD 초안 작성
- 프로젝트 개요, 문제 정의, 서비스 목표, MVP 범위 정의
- 사용자 입력 항목 및 핵심 요구사항 정의
- AI 응답 원칙, 추천 결과 구조, 성공 기준, 리스크 정리
- 면책 문구와 미정 사항 추가

### 변경 사유

- Phase 1 개발 착수 전 MVP 범위와 요구사항을 명확히 정의하기 위함
- Codex 구현 지시의 제품 기준 문서를 먼저 확정하기 위함
- 금융 도메인 특성상 AI 추천의 제약 조건과 면책 기준을 초기 단계에서 명시하기 위함

### 영향 범위

- docs/phase1/flow.md
- docs/phase1/scenario.md
- docs/phase1/IA.md
- docs/phase1/api-spec.md
- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 및 프론트엔드 초기 구현 범위
