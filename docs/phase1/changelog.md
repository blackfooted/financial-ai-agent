# changelog.md

## 버전 관리 기준

- changelog 버전은 프로젝트 전체 문서 변경 단위 기준으로 관리한다.
- 개별 문서별 버전이 아니라, Phase 1 문서 세트의 변경 이력을 순차 기록한다.
- 동일 날짜에 여러 문서를 수정하더라도 작업 단위가 다르면 버전을 분리할 수 있다.

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
