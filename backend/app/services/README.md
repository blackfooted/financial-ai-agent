# services

Phase 1 백엔드 서비스 로직을 배치하는 폴더입니다.

예정 역할:

- 금융상품 데이터 조회 서비스
- 상품 정규화 mapper
- 추천 후보 생성 로직
- AI 프롬프트 구성 로직

실제 구현은 후속 단계에서 진행합니다.

## product_loader.py

샘플 금융상품 데이터를 로드하는 모듈입니다.

현재 구현 범위:

- `app/data/sample_products.json` 로드
- 반환 구조: `{"meta": {...}, "products": [...]}`
- 호출자는 `result["products"]`로 상품 목록에 접근
- 실제 금융감독원 API 호출 없음
- 추천 API mock 구현 전 샘플 데이터 확인용

후속 예정:

- 상품 유형별 필터링
- 금융권역별 필터링
- 추천 후보 생성 로직
- 금감원 API adapter/mapper 구현

## recommendation_service.py

Phase 1 추천 API의 mock 비즈니스 로직을 담당합니다.

현재 구현 범위:

- 샘플 상품 데이터 로드
- 상품 유형 필터링
- 금융권역 필터링
- 기간 우선 필터링
- 금리 기준 정렬
- 상위 최대 5개 추천 후보 생성
- mock OpenAI 클라이언트 호출
- AI mock 응답과 추천 후보 결합

실제 금융감독원 API 호출과 실제 OpenAI API 호출은 아직 구현하지 않습니다.
