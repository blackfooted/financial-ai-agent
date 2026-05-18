from __future__ import annotations

import os


def create_mock_report(transaction: dict, detection: dict) -> dict:
    provider = os.getenv("PHASE2_AI_PROVIDER", "mock").lower()
    # Phase 2에서는 openai 설정이어도 실제 외부 API를 호출하지 않고 mock 리포트를 반환한다.
    if provider != "mock":
        provider = "mock"

    detected_rules = detection["detected_rules"]
    if detected_rules:
        summary = (
            f"{detection['reason_summary']} "
            f"위험도는 {detection['risk_level']}({detection['risk_label']})이며 "
            f"risk_score는 {detection['risk_score']}점입니다."
        )
    else:
        summary = "문서 기준 탐지 룰에 해당하지 않는 정상 후보 거래입니다. 담당자 확인 후 상태를 확정해야 합니다."

    return {
        "transaction_id": transaction["transaction_id"],
        "provider": provider,
        "report_title": "의심거래 검토 리포트 초안",
        "risk_level": detection["risk_level"],
        "risk_label": detection["risk_label"],
        "summary": summary,
        "detected_rules": detected_rules,
        "review_points": _build_review_points(detected_rules),
        "disclaimer": "본 리포트는 담당자 검토를 위한 초안이며, 최종 판단은 담당자가 수행합니다.",
    }


def _build_review_points(detected_rules: list[str]) -> list[str]:
    if not detected_rules:
        return ["탐지 룰에 해당하지 않더라도 거래 맥락상 특이사항이 있는지 확인합니다."]

    points_by_rule = {
        "HIGH_AMOUNT": "최근 평균 거래 금액과 비교해 고액 거래 사유를 확인합니다.",
        "NEW_DEVICE": "신규 기기 등록 이력과 본인 사용 여부를 확인합니다.",
        "REPEAT_TX": "단시간 반복 거래의 수취인, 금액, 분할 거래 가능성을 확인합니다.",
        "ODD_HOUR": "심야 시간대 거래가 고객의 일반 이용 패턴과 부합하는지 확인합니다.",
        "LOCATION_MISMATCH": "직전 거래 위치, 접속 IP, 기기 정보의 정합성을 확인합니다.",
    }
    return [points_by_rule[rule] for rule in detected_rules]

