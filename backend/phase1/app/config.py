import logging
import os


APP_ENV = os.getenv("APP_ENV", "local")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
FSS_API_KEY = os.getenv("FSS_API_KEY")

# ALLOWED_ORIGINS는 comma-separated 문자열을 리스트로 변환한다.
_raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in _raw_allowed_origins.split(",")
    if origin.strip()
]

logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper(), logging.INFO))

# 이번 단계에서는 API Key가 없어도 앱 실행을 허용한다.
# 후속 추천 API 구현 시 API Key 검증과 오류 처리를 별도로 다룬다.
# 후속 리팩토링에서는 import 시점 경고를 FastAPI lifespan 또는 startup 이벤트로 이동할 수 있다.
if not OPENAI_API_KEY:
    logging.warning("OPENAI_API_KEY가 설정되지 않았습니다. 추천 API 구현 시 필요합니다.")

if not FSS_API_KEY:
    logging.warning("FSS_API_KEY가 설정되지 않았습니다. 금융상품 API 연동 시 필요합니다.")
