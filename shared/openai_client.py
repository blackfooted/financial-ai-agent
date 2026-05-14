"""Phase 1 OpenAI 공통 호출 인터페이스.

현재 단계에서는 실제 OpenAI API를 호출하지 않고 mock 응답만 반환한다.
후속 단계에서 실제 SDK 연결 시 이 모듈 내부 구현만 교체하는 것을 목표로 한다.
"""

from __future__ import annotations

import json
import re


def _extract_ranks(candidates_text: str, limit: int = 5) -> list[int]:
    """추천 후보 텍스트에서 rank 값을 추출한다."""
    ranks: list[int] = []
    seen: set[int] = set()

    for match in re.finditer(r"rank\s*:\s*(\d+)", candidates_text):
        rank = int(match.group(1))
        if rank in seen:
            continue

        ranks.append(rank)
        seen.add(rank)

        if len(ranks) >= limit:
            break

    return ranks or [1]


def generate_recommendation_explanation(
    *,
    user_context: dict,
    candidates_text: str,
    goal_mismatch_notice: str | None = None,
    model: str | None = None,
) -> dict:
    """추천 후보 설명 생성을 위한 mock OpenAI 호출 인터페이스.

    실제 OpenAI API 호출은 수행하지 않는다. model 인자는 향후 실제 호출 연결 시
    사용할 수 있도록 인터페이스에만 포함한다.
    """
    if not isinstance(user_context, dict):
        raise ValueError("user_context는 dict여야 합니다.")

    if not isinstance(candidates_text, str):
        raise ValueError("candidates_text는 str이어야 합니다.")

    if goal_mismatch_notice is not None and not isinstance(goal_mismatch_notice, str):
        raise ValueError("goal_mismatch_notice는 str 또는 None이어야 합니다.")

    summary = "입력 조건과 추천 후보를 기준으로 금융상품을 비교해 볼 수 있습니다."
    if goal_mismatch_notice:
        summary = f"{summary} 다만 {goal_mismatch_notice}"

    base_cautions = [
        "금리와 상품 조건은 변경될 수 있습니다.",
        "실제 가입 전 금융회사와 금융감독원 공시 정보를 확인하시기 바랍니다.",
    ]

    if user_context.get("product_type") == "loan":
        base_cautions.append(
            "대출 상품의 실제 승인 여부, 한도, 적용 금리는 금융회사 심사 결과에 따라 달라질 수 있습니다."
        )

    product_reasons = [
        {
            "rank": rank,
            "recommendation_reason": "입력 조건과 비교 기준에 따라 참고할 수 있는 상품입니다.",
            "cautions": list(base_cautions),
        }
        for rank in _extract_ranks(candidates_text)
    ]

    return {
        "summary": summary,
        "product_reasons": product_reasons,
        "comparison_points": [
            "기본금리와 최고우대금리를 함께 비교해야 합니다.",
            "우대금리 조건을 실제로 충족할 수 있는지 확인해야 합니다.",
        ],
    }


if __name__ == "__main__":
    sample = generate_recommendation_explanation(
        user_context={
            "product_type": "saving",
            "age": 29,
            "amount": 500000,
            "saving_period_months": 12,
            "financial_goal": "lump_sum",
            "preferred_institutions": "은행",
        },
        candidates_text="""- rank: 1, 회사명: 예시은행, 상품명: 예시 적금
- rank: 2, 회사명: 예시저축은행, 상품명: 예시 적금""",
    )
    print(json.dumps(sample, ensure_ascii=False, indent=2))
