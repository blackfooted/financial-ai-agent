"""금융상품 원천 응답을 내부 정규화 상품 데이터로 변환하는 mapper."""

from __future__ import annotations

from typing import Any


def map_fss_product_to_normalized(
    *,
    raw_product: dict,
    product_type: str,
    top_fin_grp_no: str,
    financial_sector: str,
    financial_sector_name: str,
) -> dict[str, Any]:
    """FSS baseList 단일 상품 기본 정보 항목을 내부 상품 구조로 변환한다.

    raw_product는 FSS API 응답 전체가 아니라 result.baseList 배열의 단일 항목이다.
    원천 응답은 raw_product에 보관하되, 프론트엔드 응답에 그대로 노출하지 않는다.
    """
    return {
        "company_code": raw_product.get("fin_co_no"),
        "company_name": raw_product.get("kor_co_nm"),
        "product_code": raw_product.get("fin_prdt_cd"),
        "product_name": raw_product.get("fin_prdt_nm"),
        "join_way": raw_product.get("join_way"),
        "product_type": product_type,
        "top_fin_grp_no": top_fin_grp_no,
        "financial_sector": financial_sector,
        "financial_sector_name": financial_sector_name,
        # TODO: 실제 FSS API 응답 샘플 확인 후 optionList를 기반으로
        # base_rate, max_rate, period_months 매핑 로직을 추가한다.
        "base_rate": None,
        "max_rate": None,
        "period_months": None,
        "raw_product": raw_product,
    }
