"""Phase 1 AI explanation client.

The default provider is mock. A real OpenAI API call is made only when
AI_PROVIDER=openai is set at function-call time.
"""

from __future__ import annotations

import json
import logging
import os
import re


ALLOWED_AI_PROVIDERS = {"mock", "openai"}
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_OPENAI_TIMEOUT_SECONDS = 20.0
DEFAULT_OPENAI_MAX_RETRIES = 1


def _extract_ranks(candidates_text: str, limit: int = 5) -> list[int]:
    """Extract rank values from the candidate text used by the mock response."""
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
    """Generate recommendation explanations using mock or OpenAI mode."""
    _validate_inputs(
        user_context=user_context,
        candidates_text=candidates_text,
        goal_mismatch_notice=goal_mismatch_notice,
    )

    ai_provider = os.getenv("AI_PROVIDER", "mock").lower()
    if ai_provider not in ALLOWED_AI_PROVIDERS:
        logging.warning("AI_PROVIDER value is invalid. Falling back to mock.")
        ai_provider = "mock"

    if ai_provider == "openai":
        return _generate_openai_recommendation_explanation(
            user_context=user_context,
            candidates_text=candidates_text,
            goal_mismatch_notice=goal_mismatch_notice,
            model=model,
        )

    return _generate_mock_recommendation_explanation(
        user_context=user_context,
        candidates_text=candidates_text,
        goal_mismatch_notice=goal_mismatch_notice,
        model=model,
    )


def _validate_inputs(
    *,
    user_context: dict,
    candidates_text: str,
    goal_mismatch_notice: str | None,
) -> None:
    if not isinstance(user_context, dict):
        raise ValueError("user_context must be a dict.")

    if not isinstance(candidates_text, str):
        raise ValueError("candidates_text must be a str.")

    if goal_mismatch_notice is not None and not isinstance(goal_mismatch_notice, str):
        raise ValueError("goal_mismatch_notice must be a str or None.")


def _generate_mock_recommendation_explanation(
    *,
    user_context: dict,
    candidates_text: str,
    goal_mismatch_notice: str | None = None,
    model: str | None = None,
) -> dict:
    """Return a deterministic mock response compatible with the recommendation API."""
    summary = (
        "입력 조건과 추천 후보를 기준으로 금융상품을 비교해 볼 수 있습니다."
    )
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


def _generate_openai_recommendation_explanation(
    *,
    user_context: dict,
    candidates_text: str,
    goal_mismatch_notice: str | None = None,
    model: str | None = None,
) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    try:
        from openai import OpenAI
    except Exception as exc:
        raise RuntimeError("OpenAI SDK import failed.") from exc

    prompt = _build_recommendation_prompt(
        user_context=user_context,
        candidates_text=candidates_text,
        goal_mismatch_notice=goal_mismatch_notice,
    )
    openai_model = model or os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
    timeout_seconds = _get_float_env(
        "OPENAI_TIMEOUT_SECONDS",
        DEFAULT_OPENAI_TIMEOUT_SECONDS,
    )
    max_retries = _get_int_env(
        "OPENAI_MAX_RETRIES",
        DEFAULT_OPENAI_MAX_RETRIES,
    )

    try:
        client = OpenAI(
            api_key=api_key,
            timeout=timeout_seconds,
            max_retries=max_retries,
        )
        response = client.responses.create(
            model=openai_model,
            input=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
    except Exception as exc:
        raise RuntimeError("OpenAI API call failed.") from exc

    output_text = getattr(response, "output_text", None)
    if not output_text:
        raise RuntimeError("OpenAI response text is empty.")

    try:
        payload = json.loads(output_text)
    except json.JSONDecodeError as exc:
        raise ValueError("OpenAI response was not valid JSON.") from exc

    if not isinstance(payload, dict):
        raise ValueError("OpenAI response JSON must be an object.")

    return _validate_ai_response_payload(payload)


def _build_recommendation_prompt(
    *,
    user_context: dict,
    candidates_text: str,
    goal_mismatch_notice: str | None,
) -> str:
    user_lines = [
        "[사용자 조건]",
        f"- 상품 유형: {user_context.get('product_type')}",
        f"- 나이: {user_context.get('age')}",
        f"- 금액: {user_context.get('amount')}",
        f"- 가입 또는 이용 기간: {user_context.get('saving_period_months')}",
        f"- 금융 목적: {user_context.get('financial_goal')}",
        f"- 선호 금융권역: {user_context.get('preferred_institutions')}",
    ]
    if goal_mismatch_notice:
        user_lines.append(f"- 조건 불일치 가능성: {goal_mismatch_notice}")

    return "\n".join(
        [
            "당신은 금융상품 탐색을 돕는 참고용 AI입니다.",
            "아래 사용자 조건과 추천 후보를 바탕으로 각 상품의 비교 참고 사유와 주의사항을 설명하세요.",
            "",
            "중요 기준:",
            "- 금융상품 가입을 권유하지 마세요.",
            "- 금융 자문을 제공하지 마세요.",
            "- 대출 승인 가능성, 한도, 개인별 적용 금리를 단정하지 마세요.",
            "- 추천 후보에 없는 상품명, 금융회사명, 금리, 조건을 새로 만들지 마세요.",
            "- 추천 후보의 rank 값을 유지하세요.",
            "- raw_product 전체, 내부 로그, API Key, 원천 API 전체 응답은 사용하지 마세요.",
            "- 반드시 아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트를 포함하지 마세요.",
            "",
            *user_lines,
            "",
            "[추천 후보]",
            candidates_text,
            "",
            "[출력 JSON 형식]",
            "{",
            '  "summary": "string 또는 null",',
            '  "product_reasons": [',
            "    {",
            '      "rank": 1,',
            '      "recommendation_reason": "string 또는 null",',
            '      "cautions": ["string"]',
            "    }",
            "  ],",
            '  "comparison_points": ["string"]',
            "}",
        ]
    )


def _validate_ai_response_payload(payload: dict) -> dict:
    summary = payload.get("summary")
    if summary is not None and not isinstance(summary, str):
        summary = None

    raw_product_reasons = payload.get("product_reasons")
    product_reasons = []
    if isinstance(raw_product_reasons, list):
        for item in raw_product_reasons:
            if not isinstance(item, dict):
                continue

            recommendation_reason = item.get("recommendation_reason")
            if recommendation_reason is not None and not isinstance(
                recommendation_reason,
                str,
            ):
                recommendation_reason = None

            cautions = item.get("cautions")
            if not isinstance(cautions, list):
                cautions = []

            product_reasons.append(
                {
                    "rank": item.get("rank"),
                    "recommendation_reason": recommendation_reason,
                    "cautions": [
                        caution
                        for caution in cautions
                        if isinstance(caution, str)
                    ],
                }
            )

    comparison_points = payload.get("comparison_points")
    if not isinstance(comparison_points, list):
        comparison_points = []

    return {
        "summary": summary,
        "product_reasons": product_reasons,
        "comparison_points": [
            point
            for point in comparison_points
            if isinstance(point, str)
        ],
    }


def _get_float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _get_int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


if __name__ == "__main__":
    # This direct smoke test uses the current AI_PROVIDER value.
    # With the default mock provider it never calls OpenAI. Setting
    # AI_PROVIDER=openai may make a real API call and can incur cost.
    sample = generate_recommendation_explanation(
        user_context={
            "product_type": "saving",
            "age": 29,
            "amount": 500000,
            "saving_period_months": 12,
            "financial_goal": "lump_sum",
            "preferred_institutions": "bank",
        },
        candidates_text="""- rank: 1, company: Sample Bank, product: Sample Saving
- rank: 2, company: Sample Savings Bank, product: Sample Saving Plus""",
    )
    print(f"AI_PROVIDER={os.getenv('AI_PROVIDER', 'mock').lower()}")
    print(json.dumps(sample, ensure_ascii=False, indent=2))
