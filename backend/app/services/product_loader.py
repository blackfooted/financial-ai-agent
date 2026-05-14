import json
from collections import Counter
from json import JSONDecodeError
from pathlib import Path
from typing import Any

from app.services.product_mapper import map_fss_product_to_normalized


DATA_DIR = Path(__file__).resolve().parents[1] / "data"
SAMPLE_PRODUCTS_PATH = DATA_DIR / "sample_products.json"


def load_sample_products() -> dict[str, Any]:
    """Phase 1 mock 추천 API용 샘플 상품 데이터를 로드한다.

    실제 금융감독원 API 호출은 수행하지 않는다.
    필터링과 추천 후보 생성 로직은 후속 단계에서 구현한다.
    """
    try:
        with SAMPLE_PRODUCTS_PATH.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError as exc:
        raise FileNotFoundError("샘플 상품 데이터 파일을 찾을 수 없습니다.") from exc
    except JSONDecodeError as exc:
        raise ValueError("샘플 상품 데이터 JSON 형식이 올바르지 않습니다.") from exc

    if not isinstance(data, dict) or not isinstance(data.get("products"), list):
        raise ValueError("샘플 상품 데이터는 meta와 products 목록을 포함해야 합니다.")

    return data


def load_products_from_fss_response(
    *,
    fss_response: dict[str, Any],
    product_type: str,
    top_fin_grp_no: str,
    financial_sector: str,
    financial_sector_name: str,
) -> dict[str, Any]:
    """FSS 원천 응답을 내부 products 구조로 변환한다.

    추천 API 기본 흐름은 아직 이 함수를 사용하지 않고 sample_products.json을 유지한다.
    """
    base_list = fss_response.get("result", {}).get("baseList", [])
    if not isinstance(base_list, list):
        raise ValueError("FSS API 응답의 result.baseList가 배열이 아닙니다.")

    products = [
        map_fss_product_to_normalized(
            raw_product=raw_product,
            product_type=product_type,
            top_fin_grp_no=top_fin_grp_no,
            financial_sector=financial_sector,
            financial_sector_name=financial_sector_name,
        )
        for raw_product in base_list
        if isinstance(raw_product, dict)
    ]

    return {
        "meta": {
            "provider": "fss",
            "cache_used": False,
        },
        "products": products,
    }


if __name__ == "__main__":
    loaded = load_sample_products()
    products = loaded["products"]
    counts = Counter(product.get("product_type", "unknown") for product in products)

    print(f"sample products loaded: {len(products)}")
    for product_type in ("deposit", "saving", "loan"):
        print(f"{product_type}: {counts.get(product_type, 0)}")
