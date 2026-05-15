# services

Phase 1 백엔드 서비스 로직을 배치하는 폴더입니다.

## 현재 모듈

- `product_loader.py`: 샘플 상품 데이터 로드 및 FSS 응답 변환 준비
- `recommendation_service.py`: 기존 mock 추천 API 비즈니스 로직
- `fss_client.py`: 금융감독원 금융상품통합비교공시 API 호출 준비 클라이언트
- `product_mapper.py`: FSS `baseList`와 `optionList`를 내부 정규화 상품 데이터로 변환하는 mapper

## product_mapper.py

FSS API의 `baseList`와 `optionList` 응답을 내부 정규화 상품 데이터로 변환합니다.

현재 구현 범위:

- `baseList` 단일 상품 항목 매핑
- `optionList`에서 기간/금리 정보 선택
- `fin_co_no + fin_prdt_cd` 기준 baseList와 optionList 결합
- 예금/적금의 `intr_rate`, `intr_rate2`, `save_trm` 매핑
- 적금의 `rsrv_type`, `rsrv_type_nm`은 후속 확장 대상으로 유지
- 직접 실행 시 저장된 FSS 샘플 파일 기반 mapper 결과 확인 가능

실제 추천 API는 아직 `sample_products.json` mock 데이터를 사용합니다.

## fss_product_service.py

FSS API 기반 상품 데이터 조회와 캐시를 담당합니다.

현재 구현 범위:

- `PRODUCT_DATA_SOURCE=fss`일 때 사용
- 은행권 예금/적금 조회
- 24시간 파일 캐시
- 캐시 저장 실패 시 경고 로그 후 해당 요청은 실시간 FSS 응답으로 처리
- FSS 원천 응답을 정규화 상품 데이터로 변환
- 추천 API에는 정규화 products 구조로 전달

제외 범위:

- 저축은행 실제 조회
- 대출 실제 조회
- sample fallback 자동 전환

## 구현 기준

- 추천 API 기본 흐름은 아직 `sample_products.json` mock 데이터를 사용합니다.
- `fss_client.py`는 단독 테스트와 후속 실제 연동 준비를 위한 모듈입니다.
- 실제 OpenAI API 호출과 실제 금융감독원 API 호출을 추천 API 기본 흐름에 연결하지 않습니다.

## usage_limiter.py

OpenAI 실제 호출 모드에서 추천 API의 일일 호출 횟수를 제한합니다.

현재 구현 범위:

- `AI_PROVIDER=openai`일 때만 적용
- `POST /api/phase1/recommendations` 추천 API 호출에만 적용
- 파일 기반 일일 카운터 사용
- 기본 제한값: `OPENAI_DAILY_LIMIT=10`
- quota 초과 시 HTTP 429 반환

주의:

- Phase 1 파일 기반 카운터는 Render Free 티어 재시작 시 초기화될 수 있습니다.
- 운영 수준에서는 Redis, DB, 외부 KV 저장소 기반 rate limit을 검토해야 합니다.
