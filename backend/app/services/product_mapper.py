"""FSS 원천 응답을 내부 정규화 상품 데이터로 변환하는 mapper."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def map_fss_product_to_normalized(
    *,
    raw_product: dict,
    product_type: str,
    top_fin_grp_no: str,
    financial_sector: str,
    financial_sector_name: str,
    raw_options: list[dict] | None = None,
    preferred_period_months: int | None = None,
) -> dict[str, Any]:
    """FSS baseList 단일 상품 기본 정보 항목을 내부 상품 구조로 변환한다.

    raw_product는 FSS API 응답 전체가 아니라 result.baseList 배열의 단일 항목이다.
    raw_options는 fin_co_no + fin_prdt_cd 기준으로 매칭된 해당 상품의 optionList 항목 목록이다.
    """
    selected_option = _select_best_option(
        raw_options=raw_options or [],
        product_type=product_type,
        preferred_period_months=preferred_period_months,
    )

    return {
        "company_code": raw_product.get("fin_co_no"),
        "company_name": raw_product.get("kor_co_nm"),
        "financial_sector": financial_sector,
        "financial_sector_name": financial_sector_name,
        "top_fin_grp_no": top_fin_grp_no,
        "product_code": raw_product.get("fin_prdt_cd"),
        "product_name": raw_product.get("fin_prdt_nm"),
        "product_type": product_type,
        "base_rate": _to_float(selected_option.get("intr_rate"))
        if selected_option
        else None,
        "max_rate": _to_float(selected_option.get("intr_rate2"))
        if selected_option
        else None,
        "period_months": _to_int(selected_option.get("save_trm"))
        if selected_option
        else None,
        "join_way": raw_product.get("join_way"),
        # 원천 응답 전체나 optionList 전체를 프론트엔드 응답에 노출하지 않는다.
        # 적금의 rsrv_type, rsrv_type_nm은 selected_option에 보존하고 후속 확장 시 검토한다.
        "raw_product": {
            "base": raw_product,
            "selected_option": selected_option,
        },
    }


def group_options_by_product(
    raw_options: list[dict],
) -> dict[tuple[str | None, str | None], list[dict]]:
    """fin_co_no + fin_prdt_cd 기준으로 optionList 항목을 묶는다."""
    grouped: dict[tuple[str | None, str | None], list[dict]] = {}
    for option in raw_options:
        key = (option.get("fin_co_no"), option.get("fin_prdt_cd"))
        grouped.setdefault(key, []).append(option)
    return grouped


def map_fss_response_to_normalized_products(
    *,
    raw_response: dict,
    product_type: str,
    top_fin_grp_no: str,
    financial_sector: str,
    financial_sector_name: str,
    preferred_period_months: int | None = None,
) -> list[dict[str, Any]]:
    """FSS 응답의 baseList와 optionList를 결합해 정규화 상품 목록을 만든다."""
    result = raw_response.get("result", {})
    base_list = result.get("baseList", [])
    option_list = result.get("optionList", [])

    if not isinstance(base_list, list):
        raise ValueError("FSS 응답의 result.baseList가 배열이 아닙니다.")
    if not isinstance(option_list, list):
        raise ValueError("FSS 응답의 result.optionList가 배열이 아닙니다.")

    grouped_options = group_options_by_product(option_list)
    products: list[dict[str, Any]] = []

    for raw_product in base_list:
        if not isinstance(raw_product, dict):
            continue

        key = (raw_product.get("fin_co_no"), raw_product.get("fin_prdt_cd"))
        products.append(
            map_fss_product_to_normalized(
                raw_product=raw_product,
                product_type=product_type,
                top_fin_grp_no=top_fin_grp_no,
                financial_sector=financial_sector,
                financial_sector_name=financial_sector_name,
                raw_options=grouped_options.get(key, []),
                preferred_period_months=preferred_period_months,
            ),
        )

    return products


def _select_best_option(
    *,
    raw_options: list[dict],
    product_type: str,
    preferred_period_months: int | None = None,
) -> dict | None:
    """기간 우선, 최고 우대금리 우선 기준으로 option을 선택한다."""
    if not raw_options:
        return None
    if product_type not in {"deposit", "saving"}:
        return None

    candidate_options = raw_options
    if preferred_period_months is not None:
        period_matches = [
            option
            for option in raw_options
            if _to_int(option.get("save_trm")) == preferred_period_months
        ]
        if period_matches:
            candidate_options = period_matches

    return max(candidate_options, key=_rate_for_compare)


def _rate_for_compare(option: dict) -> float:
    return _to_float(option.get("intr_rate2")) or _to_float(option.get("intr_rate")) or 0


def _to_int(value: Any) -> int | None:
    try:
        if value is None or value == "":
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _to_float(value: Any) -> float | None:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _load_sample(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def _print_first_product(label: str, products: list[dict[str, Any]]) -> None:
    print(f"{label} mapped: {len(products)}")
    if not products:
        return

    first = products[0]
    print(
        f"{label} first product: {first.get('product_name')} / "
        f"base_rate={first.get('base_rate')} / "
        f"max_rate={first.get('max_rate')} / "
        f"period_months={first.get('period_months')}",
    )


if __name__ == "__main__":
    data_dir = Path(__file__).resolve().parents[1] / "data"

    deposit_products = map_fss_response_to_normalized_products(
        raw_response=_load_sample(data_dir / "fss_deposit_sample.json"),
        product_type="deposit",
        top_fin_grp_no="020000",
        financial_sector="first_sector",
        financial_sector_name="제1금융권",
        preferred_period_months=12,
    )
    saving_products = map_fss_response_to_normalized_products(
        raw_response=_load_sample(data_dir / "fss_saving_sample.json"),
        product_type="saving",
        top_fin_grp_no="020000",
        financial_sector="first_sector",
        financial_sector_name="제1금융권",
        preferred_period_months=12,
    )

    _print_first_product("deposit", deposit_products)
    _print_first_product("saving", saving_products)
