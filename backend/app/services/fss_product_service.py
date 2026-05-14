"""FSS 상품 데이터 조회와 파일 캐시를 담당하는 서비스."""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timedelta, timezone
from json import JSONDecodeError
from pathlib import Path
from typing import Any

from app.services.fss_client import TOP_FIN_GRP_BANK, fetch_products_by_type
from app.services.product_mapper import map_fss_response_to_normalized_products


CACHE_TTL_HOURS = 24
CACHE_DIR = Path(__file__).resolve().parents[1] / "data" / "cache"
FSS_FETCHED_AT_FORMAT = "%Y-%m-%dT%H:%M:%S%z"


class FssProductDataError(RuntimeError):
    """FSS 상품 데이터를 추천 API용으로 준비하지 못한 경우."""


def load_fss_products(
    *,
    product_type: str,
    preferred_institutions: list[str],
    preferred_period_months: int | None = None,
) -> dict[str, Any]:
    """FSS 데이터 소스에서 추천 후보 상품을 로드한다.

    Phase 1 실제 FSS 연동은 은행권 예금/적금만 우선 지원한다.
    `all` 또는 `bank + savings_bank` 요청도 현재는 은행권만 조회하고, 저축은행은 후속 확장한다.
    """
    if not os.getenv("FSS_API_KEY"):
        raise FssProductDataError(
            "FSS_API_KEY가 설정되지 않았습니다. PRODUCT_DATA_SOURCE=fss 사용 시 필요합니다.",
        )
    if product_type == "loan":
        raise FssProductDataError("대출 상품 실제 FSS 연동은 후속 작업입니다.")
    if product_type not in {"deposit", "saving"}:
        raise FssProductDataError(f"지원하지 않는 FSS 상품 유형입니다: {product_type}")
    if preferred_institutions == ["savings_bank"]:
        raise FssProductDataError("저축은행 FSS 조회는 아직 지원하지 않습니다.")

    top_fin_grp_no = TOP_FIN_GRP_BANK
    cached = _load_valid_cache(product_type=product_type, top_fin_grp_no=top_fin_grp_no)
    if cached:
        raw_response = cached["raw_response"]
        fetched_at = cached["meta"]["fetched_at"]
        cache_used = True
    else:
        raw_response, fetched_at = _fetch_and_cache(
            product_type=product_type,
            top_fin_grp_no=top_fin_grp_no,
        )
        cache_used = False

    _validate_fss_response(raw_response)
    products = map_fss_response_to_normalized_products(
        raw_response=raw_response,
        product_type=product_type,
        top_fin_grp_no=top_fin_grp_no,
        financial_sector="first_sector",
        financial_sector_name="제1금융권",
        preferred_period_months=preferred_period_months,
    )

    return {
        "meta": {
            "provider": "fss",
            "fetched_at": fetched_at,
            "cache_used": cache_used,
        },
        "products": products,
    }


def _fetch_and_cache(*, product_type: str, top_fin_grp_no: str) -> tuple[dict, str]:
    try:
        raw_response = fetch_products_by_type(
            product_type=product_type,
            top_fin_grp_no=top_fin_grp_no,
        )
    except Exception as exc:
        raise FssProductDataError("금융상품 정보를 불러오지 못했습니다.") from exc

    fetched_at = _now().strftime(FSS_FETCHED_AT_FORMAT)
    cache_payload = {
        "meta": {
            "provider": "fss",
            "product_type": product_type,
            "top_fin_grp_no": top_fin_grp_no,
            "fetched_at": fetched_at,
        },
        "raw_response": raw_response,
    }

    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        _cache_path(product_type=product_type, top_fin_grp_no=top_fin_grp_no).write_text(
            json.dumps(cache_payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except OSError as exc:
        logging.warning("FSS 캐시 저장에 실패했습니다. 실시간 응답으로 계속 처리합니다: %s", exc)

    return raw_response, fetched_at


def _load_valid_cache(*, product_type: str, top_fin_grp_no: str) -> dict[str, Any] | None:
    path = _cache_path(product_type=product_type, top_fin_grp_no=top_fin_grp_no)
    if not path.exists():
        return None

    try:
        cached = json.loads(path.read_text(encoding="utf-8"))
        fetched_at = cached.get("meta", {}).get("fetched_at")
        fetched_at_dt = _parse_fetched_at(fetched_at)
        if fetched_at_dt is None:
            return None
        if _now() - fetched_at_dt > timedelta(hours=CACHE_TTL_HOURS):
            return None
        if not isinstance(cached.get("raw_response"), dict):
            return None
        return cached
    except (JSONDecodeError, OSError) as exc:
        logging.warning("FSS 캐시 읽기에 실패했습니다. FSS API 재호출을 시도합니다: %s", exc)
        return None


def _validate_fss_response(raw_response: dict) -> None:
    result = raw_response.get("result")
    if not isinstance(result, dict):
        raise FssProductDataError("FSS 응답의 result 구조가 올바르지 않습니다.")

    err_cd = result.get("err_cd")
    if err_cd not in (None, "000"):
        raise FssProductDataError("FSS API가 정상 응답을 반환하지 않았습니다.")


def _cache_path(*, product_type: str, top_fin_grp_no: str) -> Path:
    return CACHE_DIR / f"fss_{product_type}_{top_fin_grp_no}.json"


def _parse_fetched_at(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.strptime(value, FSS_FETCHED_AT_FORMAT)
    except ValueError:
        return None
    return parsed.astimezone(timezone.utc)


def _now() -> datetime:
    return datetime.now(timezone.utc).astimezone()
