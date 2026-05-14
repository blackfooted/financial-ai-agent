# changelog.md

## 버전 관리 기준

- changelog 버전은 프로젝트 전체 문서 변경 단위 기준으로 관리한다.
- 개별 문서별 버전이 아니라, Phase 1 문서 세트의 변경 이력을 순차 기록한다.
- 동일 날짜에 여러 문서를 수정하더라도 작업 단위가 다르면 버전을 분리할 수 있다.

- 일부 버전은 작업 취소, 파일 미반영, 또는 후속 버전에 통합된 경우 생략될 수 있다.
- 버전 번호가 일부 건너뛰어진 경우, 실제 반영된 변경 이력만 changelog에 기록한다.

> 참고: v0.4는 실제 Repo 문서 이력에 반영되지 않았거나 후속 버전에 통합된 것으로 보고, 현재 changelog에는 기록하지 않는다. 이후 필요한 경우 실제 변경 파일과 커밋 기준으로 별도 복원한다.

## [v0.24] 2026-05-14

### 변경 문서: frontend/phase1, frontend README, changelog.md

- Phase 메뉴 구조를 좌측 LNB에서 상단 GNB 형태로 전환
- Phase 1은 활성 메뉴로 표시하고 Phase 2~4는 준비 중 상태로 유지
- 페이지 타이틀 영역에 짧은 면책 문구를 항상 표시하도록 개선
- 금액 입력 필드에 원 단위 표시 추가
- 나이/금액 입력 필드의 큰 화면 그리드 표시 문제 수정
- 추천 결과 화면에서 사용자에게 불필요한 `request_id` 노출 제거
- 상품 카드에 단순 예상 이자 또는 예상 이자 부담 표시 추가
- 빈 결과 상태에 조건 변경 안내 문구 추가
- GNB 구조에 맞게 README 화면 구조 설명 수정

### 변경 사유

- Phase 4까지 하나의 프론트엔드 앱에서 확장할 구조를 더 단순하고 자연스러운 GNB 형태로 정리하기 위함
- 금융 서비스 화면에서 금액 단위와 면책 문구를 명확히 표시하기 위함
- 포트폴리오 시연 화면에서 디버깅 정보 노출을 줄이고 추천 결과 카드의 설명력을 높이기 위함
- 사용자가 빈 결과 상태에서 다음 행동을 이해할 수 있도록 하기 위함

### 영향 범위

- frontend/phase1/app/page.tsx
- frontend/phase1/components/
- frontend/phase1/README.md
- 후속 Phase 2~4 화면 확장

## [v0.23] 2026-05-14

### 변경 문서: frontend/phase1, frontend README, changelog.md

- Phase 1 프론트엔드 UI 1차 개선
- 향후 Phase 2~4 확장을 고려한 Phase 메뉴 구조 추가
- Phase 1은 활성 메뉴로 표시하고 Phase 2~4는 준비 중 상태로 표시
- Phase 2~4 메뉴명을 임의 확정하지 않고 “준비 중”으로 표시
- `AppShell.tsx`, `PhaseSidebar.tsx` 공통 레이아웃 컴포넌트 추가
- API 호출 URL을 `NEXT_PUBLIC_API_BASE_URL` 기준으로 관리하도록 정리
- 상단 서비스 소개 및 면책 안내 영역 개선
- 추천 입력 폼의 한글 표시명과 카드형 레이아웃 정리
- 추천 결과 카드 UI 개선
- 로딩, 오류, 부분 성공, 준비 중 상태 메시지 정리
- 모바일 기본 대응 구조 정리
- frontend README에 Phase 메뉴 구조와 API base URL 기준 설명 추가

### 변경 사유

- Phase 4까지 하나의 프론트엔드 화면에서 확장할 수 있는 기본 IA를 마련하기 위함
- 포트폴리오 시연 시 현재 구현 범위와 향후 Phase 확장 구조를 명확히 보여주기 위함
- 추천 API 연결 이후 사용자 화면의 가독성과 상태 표시를 개선하기 위함
- 배포 환경에서 백엔드 API URL을 환경변수로 전환할 수 있도록 하기 위함

### 영향 범위

- frontend/phase1/app/page.tsx
- frontend/phase1/app/layout.tsx
- frontend/phase1/components/
- frontend/phase1/lib/api.ts
- frontend/phase1/.env.example
- frontend/phase1/README.md
- 후속 Phase 2~4 화면 확장

## [v0.22] 2026-05-14

### 변경 문서: README.md, local-runbook.md, changelog.md

- README.md 기술 스택의 AI 모델명을 `GPT-5.4 nano`에서 `GPT-4o-mini`로 수정
- local-runbook.md의 404 응답 대응 기준을 요청 URL 경로 확인 중심으로 수정
- `NO_RECOMMENDABLE_PRODUCTS`와 일반 경로 404를 구분해 확인하도록 안내 추가
- changelog 내 잘못된 모델명 표기가 있는 경우 함께 정정

### 변경 사유

- 포트폴리오 첫 화면에 노출되는 AI 모델명을 프로젝트 환경변수 기준과 일치시키기 위함
- 404 응답을 조건 조정 문제로 오해하지 않도록 로컬 실행 가이드의 오류 대응 기준을 명확히 하기 위함
- 추천 상품 없음 응답과 API 경로 오류를 구분해 디버깅할 수 있도록 하기 위함

### 영향 범위

- README.md
- docs/phase1/local-runbook.md
- docs/phase1/changelog.md

## [v0.21] 2026-05-14

### 변경 문서: local-runbook.md, README.md, changelog.md

- Phase 1 로컬 실행 및 검증 가이드 작성
- 백엔드와 프론트엔드 실행 순서 정리
- End-to-End 추천 검증 시나리오 추가
- 상품 유형과 금융 목적 불일치 시나리오 검증 기준 보완
- 추천 API 직접 검증 명령 추가
- 정상 응답 기준과 오류 상황별 확인 방법 정리
- 3000/8000 포트 충돌 상황 확인 방법 추가
- npm moderate 취약점 등 Known Issues 정리
- 배포 전 확인 사항 체크리스트 추가
- 루트 README에 local-runbook.md 링크 추가

### 변경 사유

- 백엔드와 프론트엔드 mock 구현 완료 후 로컬 검증 절차를 문서화하기 위함
- Render 배포 전 실행 순서, 검증 기준, known issues를 명확히 하기 위함
- 포트 충돌, CORS, API 연결 실패 등 로컬 실행 중 자주 발생할 수 있는 문제를 사전에 정리하기 위함
- 포트폴리오 검토자가 프로젝트 실행 방법을 빠르게 확인할 수 있도록 하기 위함

### 영향 범위

- docs/phase1/local-runbook.md
- README.md
- 후속 배포 문서
- 후속 UI 개선 작업

## [v0.20] 2026-05-14

### 변경 문서: frontend/phase1, .gitignore, changelog.md

- Phase 1 프론트엔드 기본 Next.js App Router 구조 생성
- Node.js 20.9 이상 사전 확인 기준 추가
- create-next-app 실패 시 수동 구성 가능한 최소 파일 기준 정의
- Tailwind CSS 기반 단일 추천 페이지 구현
- 추천 조건 입력 폼 추가
- 백엔드 mock 추천 API 호출 로직 추가
- CORS 오류 발생 시 백엔드 설정 확인 안내 추가
- 추천 결과, 로딩, 오류, 부분 성공 상태 표시 구현
- 추천 API 요청/응답 TypeScript 타입 정의
- 프론트엔드 README 작성
- `.env.example`에 `NEXT_PUBLIC_API_BASE_URL` 기준 추가
- `.gitignore`에 프론트엔드 로컬 환경 및 빌드 산출물 제외 기준 확인

### 변경 사유

- 백엔드 mock 추천 API를 사용자 화면에서 호출해 end-to-end 흐름을 검증하기 위함
- Phase 1 포트폴리오 시연을 위한 최소 프론트엔드 화면을 마련하기 위함
- 추후 UI 고도화 전 API 요청/응답 구조와 화면 상태 처리를 먼저 확인하기 위함
- 프론트엔드 실행 환경과 CORS 설정으로 인한 초기 오류 가능성을 줄이기 위함

### 영향 범위

- frontend/phase1
- Phase 1 추천 API 호출 흐름
- 후속 프론트엔드 UI 고도화
- 후속 Render 배포 설정

## [v0.19] 2026-05-14

### 변경 문서: schemas.py, recommendations.py, recommendation_service.py, main.py, backend README, services/README.md, requirements.txt, changelog.md

- `POST /api/phase1/recommendations` mock API 구현
- Pydantic v2 기준 추천 요청/응답 스키마 추가
- `pydantic>=2.0` 의존성 명시
- 샘플 상품 데이터 기반 상품 유형, 금융권역, 기간 필터링 구현
- 기간 필터 폴백 시 `product_type + preferred_institutions` 필터 통과 후보 전체를 유지하는 기준 구현
- 금리 기준 정렬 및 상위 최대 5개 추천 후보 생성
- `shared/openai_client.py` mock 호출 연동
- Repo 루트를 `sys.path`에 추가해 `shared` 모듈 import 경로 보완
- `request_id`는 동일 초 내 중복 가능성이 있으나 Phase 1에서는 허용한다는 기준 주석 추가
- AI mock 응답과 추천 후보를 rank 기준으로 결합
- `success`, `partial_success`, `NO_RECOMMENDABLE_PRODUCTS` 처리 기준 구현
- 추천 라우터를 FastAPI main 앱에 등록
- backend README에 추천 API mock 검증 예시 추가
- services README에 recommendation_service.py 역할 설명 추가

### 변경 사유

- Phase 1 핵심 추천 API를 실제 외부 API 호출 없이 로컬 mock 데이터 기반으로 검증하기 위함
- 프론트엔드 구현 전 API 요청/응답 구조를 FastAPI에서 확인하기 위함
- OpenAI와 금감원 API 실제 연동 전 추천 흐름을 end-to-end로 검증하기 위함
- `shared` 모듈 import 경로와 Pydantic 버전 기준을 명확히 해 실행 오류를 줄이기 위함

### 영향 범위

- backend/phase1/app/schemas.py
- backend/phase1/app/routes/recommendations.py
- backend/phase1/app/services/recommendation_service.py
- backend/phase1/app/main.py
- backend/phase1/requirements.txt
- backend/phase1/README.md
- backend/phase1/app/services/README.md
- 후속 프론트엔드 추천 화면 구현

## [v0.18] 2026-05-14

### 변경 문서: sample_products.json, product_loader.py, services/README.md, changelog.md

- Phase 1 추천 API mock 구현을 위한 샘플 금융상품 데이터 추가
- 예금, 적금, 대출 샘플 상품 데이터 구성
- 제1금융권/제2금융권 샘플 데이터 포함
- 대출 상품의 `period_months`는 상환 기간으로 해석한다는 기준 반영
- 실제 금융감독원 API 응답이 아닌 mock 데이터임을 명시
- 샘플 상품 데이터 로더 `product_loader.py` 추가
- `load_sample_products()` 반환 구조를 `{"meta": {...}, "products": [...]}`로 정의
- 상품 데이터 로더 직접 실행 시 상품 개수와 유형별 개수 확인 가능
- services README에 product_loader.py 역할 설명 추가

### 변경 사유

- 추천 API mock 구현 전 정규화 상품 데이터 구조를 실제 파일로 고정하기 위함
- 외부 API 호출 없이 로컬에서 추천 API 응답을 구성할 수 있는 기반을 마련하기 위함
- 향후 금감원 API adapter/mapper 구현 전 샘플 데이터 기반으로 흐름을 검증하기 위함
- 대출의 `period_months` 의미와 로더 반환 구조를 명확히 해 후속 추천 API 구현 혼선을 줄이기 위함

### 영향 범위

- backend/phase1/app/data/sample_products.json
- backend/phase1/app/services/product_loader.py
- backend/phase1/app/services/README.md
- 후속 추천 API mock 구현

## [v0.17] 2026-05-14

### 변경 문서: shared/openai_client.py, shared/README.md, changelog.md

- Phase 1 OpenAI 공통 클라이언트 mock 구현
- `generate_recommendation_explanation` 함수 인터페이스 정의
- AI 응답 구조를 `ai-policy.md`와 `data-definition.md` 기준으로 정리
- 추천 후보 텍스트에서 rank를 추출해 mock `product_reasons`를 생성하는 기준 추가
- 대출 상품 선택 시 승인 여부, 한도, 개인별 금리 단정 금지 유의사항 추가
- `shared/README.md`에 openai_client.py 역할 설명 추가

### 변경 사유

- 실제 OpenAI API 연동 전 공통 호출 인터페이스를 먼저 고정하기 위함
- 추천 API mock 구현 시 AI 응답 구조를 안정적으로 사용할 수 있도록 하기 위함
- 추후 실제 OpenAI SDK 연결 시 변경 범위를 `shared/openai_client.py`로 제한하기 위함

### 영향 범위

- shared/openai_client.py
- shared/README.md
- Phase 1 추천 API mock 구현
- Phase 1 AI 응답 파싱 및 최종 응답 조립 로직

## [v0.16] 2026-05-14

### 변경 문서: backend/phase1, shared, .env.example, .gitignore, changelog.md

- Phase 1 백엔드 기본 폴더 구조 생성
- FastAPI 앱 기본 진입점 생성
- `/health` 엔드포인트 추가
- 환경변수 로딩 기준 추가
- `ALLOWED_ORIGINS` comma-separated 문자열을 리스트로 변환하는 기준 추가
- API Key 미설정 시 앱 실행은 허용하되 경고 로그를 출력하는 기준 추가
- APP_ENV와 ALLOWED_ORIGINS 기반 CORS 설정 기준 추가
- Phase 1 백엔드 실행 README 작성
- services, data, shared 폴더 역할 문서 작성
- `.env.example`에 OpenAI 및 금융감독원 API 환경변수 기준 추가
- `.gitignore`에 로컬 환경 및 빌드 산출물 제외 기준 확인

### 변경 사유

- 추천 API 구현 전 실행 가능한 최소 백엔드 구조를 마련하기 위함
- Phase 1 구현 범위를 문서 기준에서 코드 구조로 전환하기 위함
- 실제 외부 API 연동 전 mock 기반 개발을 진행할 수 있는 기반을 만들기 위함
- Render 배포 시 CORS 설정을 환경별로 조정할 수 있도록 하기 위함
- production CORS origin 설정에서 문자열/리스트 처리 오류를 방지하기 위함

### 영향 범위

- backend/phase1/app/main.py
- backend/phase1/app/routes/health.py
- backend/phase1/app/config.py
- backend/phase1/app/schemas.py
- backend/phase1/requirements.txt
- shared/
- .env.example
- .gitignore
- 후속 추천 API mock 구현

## [v0.15] 2026-05-14

### 변경 문서: ai-policy.md, changelog.md

- 프롬프트 템플릿의 `preferred_institutions` 치환 기준을 화면 표시명 기준으로 명확화
- `preferred_institutions` API 값과 프롬프트 표시값 매핑표 추가
- `goal_mismatch_notice`가 없는 경우 `조건 불일치 가능성` 줄을 프롬프트에서 생략하는 기준 추가
- 자연스러운 `product_type + financial_goal` 조합에서는 `해당 없음` 문구를 넣지 않는 기준 추가
- 후속 구현 참고 사항에 프롬프트 변수 치환 기준 추가

### 변경 사유

- AI 프롬프트에 API enum 값이 그대로 들어가 AI 이해도가 낮아지는 문제를 방지하기 위함
- 조건 불일치가 없는 정상 조합에서 불필요한 토큰 사용과 AI 응답 혼선을 줄이기 위함
- 백엔드 프롬프트 생성 로직의 변수 치환 기준을 명확히 하기 위함

### 영향 범위

- docs/phase1/ai-policy.md
- Phase 1 백엔드 OpenAI 프롬프트 구성
- Phase 1 AI 응답 생성 품질

## [v0.14] 2026-05-14

### 변경 문서: ai-policy.md, changelog.md

- AI 프롬프트 템플릿의 `candidates` 입력 형식을 텍스트 목록 기준으로 정의
- 추천 후보 텍스트 예시 추가
- 후보 텍스트에 포함할 항목과 값이 없는 경우의 처리 기준 추가
- `saving_period_months` 미입력 시 `미입력` 표기 기준 추가
- changelog 버전 관리 기준에 일부 버전 생략 가능 기준 추가
- v0.4 누락 상태에 대한 참고 문구 추가

### 변경 사유

- 백엔드 구현 시 프롬프트의 `candidates` 구성 방식이 개발자마다 달라지는 것을 방지하기 위함
- 선택 입력값인 `saving_period_months`의 프롬프트 처리 기준을 명확히 하기 위함
- changelog에서 v0.4가 누락된 상태에 대한 혼선을 줄이기 위함

### 영향 범위

- docs/phase1/ai-policy.md
- Phase 1 백엔드 OpenAI 프롬프트 구성
- Phase 1 AI 응답 파싱 및 추천 후보 매핑 로직
- docs/phase1/changelog.md

## [v0.13] 2026-05-14

### 변경 문서: ai-policy.md, changelog.md

- AI 출력 데이터 기준에서 `product_reasons` 하위 필드 구조를 별도 정의
- AI 출력 데이터 구조가 `data-definition.md` 12절과 일치해야 한다는 참조 기준 추가
- AI 응답 내부 면책 문구 기준을 공식 정보 확인 안내 중심으로 명확화
- Phase 1 기본 프롬프트 템플릿 추가
- 프롬프트 변수(`financial_goal_context`, `goal_mismatch_notice`, `candidates`) 설명 추가
- AI 출력 검증 기준 추가
- AI 응답을 그대로 전달하지 않고 백엔드 검증 후 최종 응답에 결합하는 기준 추가

### 변경 사유

- AI 응답 JSON 구조와 필드 정의 간 불일치를 해소하기 위함
- 백엔드 구현 시 프롬프트 작성 방식과 출력 검증 기준을 일관되게 적용하기 위함
- AI 응답이 금융상품 가입 권유나 금융 자문으로 오해되지 않도록 면책 안내 기준을 명확히 하기 위함
- `data-definition.md`와 `ai-policy.md` 간 AI 응답 데이터 구조 기준을 연결하기 위함

### 영향 범위

- docs/phase1/data-definition.md
- docs/phase1/api-spec.md
- Phase 1 백엔드 OpenAI 프롬프트 구성
- Phase 1 AI 응답 파싱 및 검증 로직
- Phase 1 추천 API 최종 응답 조립 로직

## [v0.12] 2026-05-14

### 변경 문서: ai-policy.md, changelog.md

- Phase 1 AI 응답 정책 문서 초안 작성
- AI의 역할과 하지 않는 일 정의
- AI 입력 데이터와 출력 데이터 기준 정의
- `financial_goal`별 프롬프트 컨텍스트 정의
- `product_type + financial_goal` 조합별 응답 기준 정의
- 불일치 조합 입력 시 오류 차단이 아닌 조건 확인 안내 기준 정의
- 상품 유형별 AI 설명 기준 정의
- 대출 상품 관련 제한 정책과 금지 표현 정의
- 면책 문구 기준 정의
- AI 응답 실패 및 `partial_success` 처리 기준 정의
- 프롬프트 작성 기준과 후속 구현 참고 사항 정리

### 변경 사유

- 금융상품 추천 결과가 가입 권유나 금융 자문으로 오해되지 않도록 AI 응답 범위를 제한하기 위함
- `api-spec.md`와 `data-definition.md`에서 정의한 데이터 구조를 AI 응답 정책과 연결하기 위함
- 백엔드에서 OpenAI 프롬프트와 응답 파싱 로직을 구현하기 전 정책 기준을 명확히 하기 위함

### 영향 범위

- docs/phase1/api-spec.md
- docs/phase1/data-definition.md
- Phase 1 백엔드 OpenAI 프롬프트 구성
- Phase 1 AI 응답 파싱 및 `partial_success` 처리
- Phase 1 프론트엔드 추천 결과/유의사항 표시

## [v0.11] 2026-05-13

### 변경 문서: data-definition.md, changelog.md

- `financial_goal`이 AI 프롬프트 입력 데이터에 포함되고 금감원 API 조회에는 사용되지 않는다는 데이터 흐름 설명 추가
- 추천 후보 데이터가 정규화 상품 데이터 전체 필드를 포함하고 추가 필드만 별도 정의한다는 기준 보완
- AI 추천 응답의 `product_reasons.rank` 필드 정의 추가
- `product_reasons.rank`와 추천 후보 데이터의 `rank`를 매핑 키로 사용한다는 기준 추가
- Phase 1 캐시 만료 기준을 기본 24시간으로 정의
- 캐시 메타데이터 예시에 `expires_at` 추가

### 변경 사유

- 추천 후보 데이터와 정규화 상품 데이터 간 포함 관계를 명확히 하기 위함
- AI 추천 응답과 추천 후보 데이터를 결합하는 기준을 명확히 하기 위함
- 금리 및 상품 조건 변동 가능성을 고려해 캐시 만료 기준을 명시하기 위함
- `financial_goal`의 사용 위치가 금감원 API 조회가 아닌 AI 프롬프트 컨텍스트임을 데이터 흐름 관점에서 명확히 하기 위함

### 영향 범위

- docs/phase1/api-spec.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 추천 후보 생성 로직
- Phase 1 AI 응답 파싱 및 최종 응답 결합 로직
- Phase 1 캐시 정책 구현

## [v0.10] 2026-05-13

### 변경 문서: data-definition.md, changelog.md

- Phase 1 데이터 정의 문서 초안 작성
- 사용자 입력 데이터, 상품 유형 데이터, 금융 목적 데이터 정의
- 금융권역과 `topFinGrpNo` 매핑 기준 정리
- 금융권역 enum과 정규화 상품 데이터의 `financial_sector` 필드 연결 기준 추가
- 금융회사 원천 필드와 정규화 필드 매핑 기준 정의
- 금융상품 원천 데이터와 정규화 상품 데이터 구조 정의
- 상품 유형별 원천 필드 상세는 실제 API 호출 테스트 후 보완하도록 명시
- 추천 후보 데이터와 AI 전달 후보 수 기본값 최대 5개 정의
- AI 추천 응답 데이터와 파싱 실패 시 `partial_success` 처리 기준 정의
- 오류 응답 데이터와 캐시 데이터 기준 정의
- Phase 1 저장 제외 데이터 정리

### 변경 사유

- api-spec.md에서 정의한 요청/응답 필드를 데이터 관점에서 구체화하기 위함
- 외부 금융상품 API 응답과 프론트엔드 응답 구조 간 정규화 기준을 마련하기 위함
- 백엔드 adapter/mapper 구현 전 데이터 구조 기준을 명확히 하기 위함
- AI 응답 실패와 추천 후보 수 기준을 구현 전 명확히 하기 위함

### 영향 범위

- docs/phase1/api-spec.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 금융상품 mapper 설계
- Phase 1 추천 API 응답 구성

## [v0.9] 2026-05-13

### 변경 문서: api-spec.md, changelog.md

- `financial_goal`의 역할을 금감원 API 필터링 값이 아닌 AI 프롬프트 컨텍스트 값으로 명확화
- `financial_goal` enum 값을 `lump_sum`, `idle_funds`, `living_expenses`, `jeonse`, `emergency`로 정리
- `financial_goal`별 우선 상품 유형 매핑 기준 추가
- `product_type`과 `financial_goal` 조합 검증 기준 추가
- 불일치 조합은 Phase 1에서 오류 차단하지 않고 AI 안내로 처리하는 기준 추가
- 향후 `ai-policy.md`에 goal별 프롬프트 컨텍스트와 불일치 조합 처리 기준을 반영하도록 후속 작업 추가

### 변경 사유

- `financial_goal`이 실제 API 필터링 값인지, AI 설명 컨텍스트 값인지 모호했던 부분을 해소하기 위함
- 프론트엔드 선택값과 백엔드 처리 기준을 동일하게 맞추기 위함
- 상품 유형과 금융 목적이 맞지 않는 입력 조합에 대한 Phase 1 처리 방식을 명확히 하기 위함
- `ai-policy.md` 작성 시 AI 응답 기준과 프롬프트 정책을 일관되게 정의하기 위함

### 영향 범위

- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 추천 API 입력 검증 및 프롬프트 구성
- Phase 1 프론트엔드 금융 목적 선택 UI

## [v0.8] 2026-05-13

### 변경 문서: api-spec.md, changelog.md

- `risk_preference` 필드를 Phase 1 요청값에서 제거
- `financial_goal`을 자유 입력이 아닌 enum 값으로 명확화
- `preferred_institutions`와 금감원 API `topFinGrpNo` 매핑 기준 추가
- Phase 1 기본 금융권역을 은행권 중심으로 정의
- 은행권/저축은행권 조회 시 외부 API 복수 호출 가능성과 캐시 우선 기준 추가
- 추천 상품 응답에 금융권역 정보(`financial_sector`, `financial_sector_name`, `top_fin_grp_no`) 추가
- 금융회사명은 금감원 API의 `kor_co_nm` 값을 매핑한다고 명시
- 상품 유형별 외부 API 호출 구조 차이를 mapper 계층에서 정규화하는 기준 추가

### 변경 사유

- 실제 필터링 기준이 모호한 입력값을 제거해 MVP 구현 복잡도를 낮추기 위함
- 프론트엔드와 백엔드가 동일한 금융 목적 enum을 사용하도록 하기 위함
- 제1금융권/제2금융권 구분과 금융회사명 표시 기준을 API 명세에 반영하기 위함
- Render Free 티어와 외부 API 호출량을 고려해 기본 조회 범위와 캐시 우선 원칙을 명확히 하기 위함

### 영향 범위

- docs/phase1/data-definition.md
- docs/phase1/ai-policy.md
- Phase 1 백엔드 금융상품 API adapter/mapper 설계
- Phase 1 프론트엔드 추천 조건 입력 및 결과 표시 구현

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
