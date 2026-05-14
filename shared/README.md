# shared

Phase 간 공통으로 사용할 모듈을 배치하는 폴더입니다.

예정 역할:

- OpenAI 호출 공통 클라이언트
- 공통 유틸리티
- 공통 타입 또는 설정

`shared/openai_client.py`는 후속 단계에서 mock 기반으로 먼저 구현합니다.

## openai_client.py

Phase 1에서 사용할 OpenAI 공통 호출 인터페이스입니다.

현재 구현 상태:

- 실제 OpenAI API 호출 없음
- mock 응답 반환
- `ai-policy.md`와 `data-definition.md` 기준의 AI 응답 구조 반환
- 향후 실제 OpenAI SDK 연결 예정

현재 함수:

- `generate_recommendation_explanation(...)`
