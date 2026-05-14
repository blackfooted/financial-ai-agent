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
