# services

Phase 1 백엔드 서비스 로직을 배치하는 폴더입니다.

## 현재 모듈

- `product_loader.py`: 샘플 상품 데이터 로드 및 FSS 응답 변환 준비
- `recommendation_service.py`: 기존 mock 추천 API 비즈니스 로직
- `fss_client.py`: 금융감독원 금융상품통합비교공시 API 호출 준비 클라이언트
- `product_mapper.py`: FSS `baseList` 단일 항목을 내부 정규화 상품 데이터로 변환하는 mapper

## 구현 기준

- 추천 API 기본 흐름은 아직 `sample_products.json` mock 데이터를 사용합니다.
- `fss_client.py`는 단독 테스트와 후속 실제 연동 준비를 위한 모듈입니다.
- `product_mapper.py`는 이번 단계에서 상품 기본 정보만 매핑합니다.
- 금리와 기간은 실제 응답 샘플 확인 후 `optionList` 기반 mapper로 보완합니다.
- 실제 OpenAI API 호출과 실제 금융감독원 API 호출을 추천 API 기본 흐름에 연결하지 않습니다.
