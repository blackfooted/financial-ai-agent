"""금융감독원 금융상품통합비교공시 API 호출 클라이언트.

이번 단계에서는 실제 추천 API 기본 흐름에 연결하지 않고, 단독 호출 가능한
클라이언트와 방어 로직만 준비한다.
"""

from __future__ import annotations

import json
import os
from json import JSONDecodeError
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


FSS_BASE_URL = "https://finlife.fss.or.kr/finlifeapi"
DEPOSIT_PRODUCTS_ENDPOINT = "depositProductsSearch.json"
SAVING_PRODUCTS_ENDPOINT = "savingProductsSearch.json"

TOP_FIN_GRP_BANK = "020000"
TOP_FIN_GRP_SAVINGS_BANK = "SAVINGS_BANK_TBD"


def fetch_deposit_products(*, top_fin_grp_no: str = TOP_FIN_GRP_BANK) -> dict:
    """예금 상품 원천 응답을 조회한다."""
    return _fetch_fss_products(
        endpoint=DEPOSIT_PRODUCTS_ENDPOINT,
        top_fin_grp_no=top_fin_grp_no,
    )


def fetch_saving_products(*, top_fin_grp_no: str = TOP_FIN_GRP_BANK) -> dict:
    """적금 상품 원천 응답을 조회한다."""
    return _fetch_fss_products(
        endpoint=SAVING_PRODUCTS_ENDPOINT,
        top_fin_grp_no=top_fin_grp_no,
    )


def fetch_products_by_type(
    *,
    product_type: str,
    top_fin_grp_no: str = TOP_FIN_GRP_BANK,
) -> dict:
    """상품 유형에 따라 FSS 예금/적금 API를 호출한다.

    대출 API는 Phase 1에서 실제 호출 대상으로 연결하지 않는다.
    """
    if product_type == "deposit":
        return fetch_deposit_products(top_fin_grp_no=top_fin_grp_no)
    if product_type == "saving":
        return fetch_saving_products(top_fin_grp_no=top_fin_grp_no)
    if product_type == "loan":
        raise NotImplementedError("대출 상품 실제 API 연동은 후속 작업으로 분리합니다.")

    raise ValueError(f"지원하지 않는 product_type입니다: {product_type}")


def _fetch_fss_products(*, endpoint: str, top_fin_grp_no: str, page_no: int = 1) -> dict:
    _guard_top_fin_grp_no(top_fin_grp_no)

    api_key = os.getenv("FSS_API_KEY")
    if not api_key:
        raise RuntimeError("FSS_API_KEY 환경변수가 설정되어 있지 않습니다.")

    # 실제 엔드포인트와 파라미터명은 FSS API 테스트 결과 기준으로 후속 보완할 수 있다.
    params = {
        "auth": api_key,
        "topFinGrpNo": top_fin_grp_no,
        "pageNo": page_no,
    }
    url = f"{FSS_BASE_URL}/{endpoint}?{urlencode(params)}"
    request = Request(url, headers={"Accept": "application/json"})

    try:
        with urlopen(request, timeout=10) as response:
            raw_body = response.read().decode("utf-8")
    except HTTPError as exc:
        raise RuntimeError(f"FSS API HTTP 오류가 발생했습니다: {exc.code}") from exc
    except URLError as exc:
        raise RuntimeError(f"FSS API 네트워크 오류가 발생했습니다: {exc.reason}") from exc
    except TimeoutError as exc:
        raise RuntimeError("FSS API 요청 시간이 초과되었습니다.") from exc

    try:
        parsed = json.loads(raw_body)
    except JSONDecodeError as exc:
        raise RuntimeError("FSS API 응답을 JSON으로 파싱하지 못했습니다.") from exc

    if not isinstance(parsed, dict):
        raise RuntimeError("FSS API 응답 JSON의 최상위 구조가 객체가 아닙니다.")

    return parsed


def _guard_top_fin_grp_no(top_fin_grp_no: str) -> None:
    if top_fin_grp_no == TOP_FIN_GRP_SAVINGS_BANK:
        raise NotImplementedError(
            "저축은행 topFinGrpNo는 아직 확정되지 않았습니다. 실제 호출 전 코드를 확정해야 합니다.",
        )


if __name__ == "__main__":
    result = fetch_deposit_products(top_fin_grp_no=TOP_FIN_GRP_BANK)
    base_list = result.get("result", {}).get("baseList", [])
    print(f"조회된 상품 수: {len(base_list)}")
