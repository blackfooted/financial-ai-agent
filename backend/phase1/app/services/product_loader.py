import json
from collections import Counter
from json import JSONDecodeError
from pathlib import Path
from typing import Any


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


if __name__ == "__main__":
    loaded = load_sample_products()
    products = loaded["products"]
    counts = Counter(product.get("product_type", "unknown") for product in products)

    print(f"sample products loaded: {len(products)}")
    for product_type in ("deposit", "saving", "loan"):
        print(f"{product_type}: {counts.get(product_type, 0)}")
