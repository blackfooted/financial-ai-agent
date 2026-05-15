import logging
import os


def _get_int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        logging.warning("%s 값이 올바르지 않습니다. 기본값 %s를 사용합니다.", name, default)
        return default


APP_ENV = os.getenv("APP_ENV", "local")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_TIMEOUT_SECONDS = _get_int_env("OPENAI_TIMEOUT_SECONDS", 20)
OPENAI_MAX_RETRIES = _get_int_env("OPENAI_MAX_RETRIES", 1)
FSS_API_KEY = os.getenv("FSS_API_KEY")

_raw_ai_provider = os.getenv("AI_PROVIDER", "mock").lower()
if _raw_ai_provider not in {"mock", "openai"}:
    logging.warning("AI_PROVIDER 값이 올바르지 않습니다. mock으로 처리합니다.")
    AI_PROVIDER = "mock"
else:
    AI_PROVIDER = _raw_ai_provider

ALLOWED_PRODUCT_DATA_SOURCES = {"sample", "fss"}
_raw_product_data_source = os.getenv("PRODUCT_DATA_SOURCE", "sample").lower()
if _raw_product_data_source not in ALLOWED_PRODUCT_DATA_SOURCES:
    logging.warning("PRODUCT_DATA_SOURCE 값이 올바르지 않습니다. sample로 처리합니다.")
    PRODUCT_DATA_SOURCE = "sample"
else:
    PRODUCT_DATA_SOURCE = _raw_product_data_source

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
if AI_PROVIDER == "openai" and not OPENAI_API_KEY:
    logging.warning("AI_PROVIDER=openai이지만 OPENAI_API_KEY가 설정되지 않았습니다.")

if not FSS_API_KEY:
    logging.warning("FSS_API_KEY가 설정되지 않았습니다. 금융상품 API 연동 시 필요합니다.")
