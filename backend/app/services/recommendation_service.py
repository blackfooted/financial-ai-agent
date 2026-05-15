from datetime import datetime
import logging
from typing import Any

from fastapi import HTTPException

from app.schemas import (
    RecommendationError,
    RecommendationRequest,
    RecommendationResponse,
    RecommendationSource,
    RecommendedProduct,
)
from app.config import PRODUCT_DATA_SOURCE
from app.services.fss_product_service import FssProductDataError, load_fss_products
from app.services.product_loader import load_sample_products
from shared.openai_client import generate_recommendation_explanation


DISCLAIMER = (
    "본 서비스는 금융상품 탐색을 돕기 위한 참고용 도구이며, "
    "금융상품 가입 권유 또는 금융 자문을 목적으로 하지 않습니다."
)

GOAL_COMPATIBILITY = {
    "saving": {"lump_sum", "emergency"},
    "deposit": {"idle_funds", "emergency"},
    "loan": {"living_expenses", "jeonse"},
}

INSTITUTION_LABELS = {
    "bank": "은행",
    "savings_bank": "저축은행",
    "all": "전체",
}


def create_recommendation(request: RecommendationRequest) -> RecommendationResponse:
    loaded = _load_products_for_source(request)
    products = loaded["products"]

    candidates = _filter_by_product_type(products, request.product_type)
    candidates = _filter_by_preferred_institutions(candidates, request.preferred_institutions)
    candidates = _filter_by_period_with_fallback(candidates, request.saving_period_months)

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "NO_RECOMMENDABLE_PRODUCTS",
                "message": "현재 조건에 맞는 상품을 찾기 어렵습니다.",
                "details": [],
            },
        )

    sorted_candidates = sorted(
        candidates,
        key=lambda product: (
            -_rate_for_sort(product),
            str(product.get("company_name") or ""),
            str(product.get("product_name") or ""),
        ),
    )
    recommended_products = [
        _build_recommended_product(product, rank)
        for rank, product in enumerate(sorted_candidates[:5], start=1)
    ]

    status = "success"
    summary = None
    comparison_points: list[str] = []
    error = None

    try:
        ai_response = generate_recommendation_explanation(
            user_context=_build_user_context(request),
            candidates_text=_build_candidates_text(recommended_products),
            goal_mismatch_notice=_build_goal_mismatch_notice(request),
        )
        summary = ai_response.get("summary")
        comparison_points = ai_response.get("comparison_points") or []
        _merge_ai_reasons(recommended_products, ai_response.get("product_reasons") or [])
    except Exception:
        # AI mock 호출 실패 시 상품 후보는 유지하고 partial_success로 응답한다.
        logging.warning("AI recommendation explanation failed. Returning partial_success.", exc_info=True)
        status = "partial_success"
        error = RecommendationError(
            error_code="OPENAI_API_ERROR",
            message="상품 목록은 확인할 수 있지만, AI 추천 설명을 생성하지 못했습니다.",
        )

    return RecommendationResponse(
        request_id=_create_request_id(),
        product_type=request.product_type,
        status=status,
        summary=summary,
        recommended_products=recommended_products,
        comparison_points=comparison_points,
        disclaimer=DISCLAIMER,
        source=_build_source(loaded.get("meta") or {}),
        error=error,
    )


def _filter_by_product_type(products: list[dict[str, Any]], product_type: str) -> list[dict[str, Any]]:
    return [product for product in products if product.get("product_type") == product_type]


def _load_products_for_source(request: RecommendationRequest) -> dict[str, Any]:
    if PRODUCT_DATA_SOURCE != "fss":
        return load_sample_products()

    try:
        return load_fss_products(
            product_type=request.product_type,
            preferred_institutions=request.preferred_institutions,
            preferred_period_months=request.saving_period_months,
        )
    except FssProductDataError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "status": "error",
                "error_code": "FINANCIAL_API_ERROR",
                "message": "금융상품 정보를 불러오지 못했습니다.",
                "details": [],
            },
        ) from exc


def _filter_by_preferred_institutions(
    products: list[dict[str, Any]],
    preferred_institutions: list[str],
) -> list[dict[str, Any]]:
    if "all" in preferred_institutions:
        return products

    allowed_sectors = set()
    if "bank" in preferred_institutions:
        allowed_sectors.add("first_sector")
    if "savings_bank" in preferred_institutions:
        allowed_sectors.add("second_sector")

    return [
        product
        for product in products
        if product.get("financial_sector") in allowed_sectors
    ]


def _filter_by_period_with_fallback(
    products: list[dict[str, Any]],
    saving_period_months: int | None,
) -> list[dict[str, Any]]:
    if saving_period_months is None:
        return products

    matched = [
        product
        for product in products
        if product.get("period_months") == saving_period_months
    ]

    # mock 데이터가 적어 추천 결과가 자주 비는 것을 막기 위해,
    # 기간이 정확히 일치하는 상품이 없으면 이전 필터를 통과한 전체 후보를 유지한다.
    return matched or products


def _rate_for_sort(product: dict[str, Any]) -> float:
    return float(product.get("max_rate") or product.get("base_rate") or 0)


def _build_recommended_product(product: dict[str, Any], rank: int) -> RecommendedProduct:
    return RecommendedProduct(
        rank=rank,
        company_name=product["company_name"],
        financial_sector=product["financial_sector"],
        financial_sector_name=product["financial_sector_name"],
        top_fin_grp_no=product.get("top_fin_grp_no"),
        product_name=product["product_name"],
        product_type=product["product_type"],
        base_rate=product.get("base_rate"),
        max_rate=product.get("max_rate"),
        period_months=product.get("period_months"),
        join_way=product.get("join_way"),
        recommendation_reason=None,
        cautions=[],
    )


def _build_candidates_text(products: list[RecommendedProduct]) -> str:
    lines = []
    for product in products[:5]:
        lines.append(
            "- "
            f"rank: {product.rank}, "
            f"회사명: {product.company_name}, "
            f"금융권역: {product.financial_sector_name}, "
            f"상품명: {product.product_name}, "
            f"기본금리: {_format_percent(product.base_rate)}, "
            f"최고우대금리: {_format_percent(product.max_rate)}, "
            f"가입기간: {_format_months(product.period_months)}, "
            f"가입방법: {product.join_way or '미제공'}"
        )
    return "\n".join(lines)


def _format_percent(value: float | None) -> str:
    if value is None:
        return "미제공"
    return f"{value}%"


def _format_months(value: int | None) -> str:
    if value is None:
        return "미제공"
    return f"{value}개월"


def _build_user_context(request: RecommendationRequest) -> dict[str, Any]:
    return {
        "product_type": request.product_type,
        "age": request.age,
        "amount": request.amount,
        "saving_period_months": request.saving_period_months,
        "financial_goal": request.financial_goal,
        "preferred_institutions": _preferred_institutions_label(request.preferred_institutions),
    }


def _preferred_institutions_label(preferred_institutions: list[str]) -> str:
    if "all" in preferred_institutions:
        return INSTITUTION_LABELS["all"]
    return ", ".join(INSTITUTION_LABELS[value] for value in preferred_institutions)


def _build_goal_mismatch_notice(request: RecommendationRequest) -> str | None:
    compatible_goals = GOAL_COMPATIBILITY.get(request.product_type, set())
    if request.financial_goal in compatible_goals:
        return None
    return "입력하신 금융 목적과 선택한 상품 유형이 다소 맞지 않을 수 있습니다."


def _merge_ai_reasons(
    products: list[RecommendedProduct],
    product_reasons: list[dict[str, Any]],
) -> None:
    products_by_rank = {product.rank: product for product in products}

    for reason in product_reasons:
        rank = reason.get("rank")
        product = products_by_rank.get(rank)
        if not product:
            continue

        product.recommendation_reason = reason.get("recommendation_reason")
        product.cautions = reason.get("cautions") or []


def _build_source(meta: dict[str, Any]) -> RecommendationSource:
    return RecommendationSource(
        provider=meta.get("provider") or "sample",
        fetched_at=meta.get("fetched_at") or "",
        cache_used=meta.get("cache_used", True),
    )


def _create_request_id() -> str:
    # 동일 초 내 중복 가능성이 있으나 Phase 1에서는 DB 저장이 없으므로 허용한다.
    # Phase 2 이후에는 UUID 또는 더 정교한 request_id 생성 방식을 검토한다.
    return datetime.now().strftime("rec_%Y%m%d_%H%M%S")
