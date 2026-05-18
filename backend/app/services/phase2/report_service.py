from __future__ import annotations

import os


RISK_TONE = {
    "low": {
        "label": "하",
        "summary": "일반 모니터링 관점에서 참고 확인이 필요한 거래입니다.",
        "action": "거래 맥락상 특이사항이 있는지 간단히 확인합니다.",
    },
    "medium": {
        "label": "중",
        "summary": "일부 비정상 패턴이 확인되어 담당자 추가 확인을 권장합니다.",
        "action": "거래 상세와 고객 이용 패턴을 비교해 추가 확인합니다.",
    },
    "high": {
        "label": "상",
        "summary": "복합 위험 신호가 확인되어 우선 검토 대상으로 분류할 수 있습니다.",
        "action": "담당자가 우선 검토하고 필요 시 고객 확인 절차를 진행합니다.",
    },
}

RULE_TEMPLATES = {
    "HIGH_AMOUNT": {
        "title": "고액 거래",
        "factor": "거래 금액이 기준 금액 또는 최근 일반 거래 금액 대비 큰 편입니다.",
        "review_points": [
            "최근 평균 거래 금액 대비 큰 금액인지 확인합니다.",
            "수취 계좌 또는 거래 목적을 확인합니다.",
            "동일 고객의 과거 고액 거래 이력을 확인합니다.",
        ],
        "actions": [
            "동일 고객의 최근 30일 거래 금액 분포와 비교합니다.",
            "수취 계좌가 신규 또는 고위험 계좌로 분류되는지 확인합니다.",
        ],
        "questions": [
            "이번 거래 금액과 거래 목적이 고객의 평소 이용 목적과 일치합니까?",
            "고객이 유사한 금액의 거래를 과거에도 정상적으로 수행한 이력이 있습니까?",
        ],
    },
    "NEW_DEVICE": {
        "title": "신규 기기",
        "factor": "기존 거래 이력에서 확인되지 않은 기기에서 거래가 발생했습니다.",
        "review_points": [
            "신규 기기 등록 또는 본인 사용 여부를 확인합니다.",
            "기존 접속 기기와 OS, 브라우저, 채널 차이를 확인합니다.",
            "기기 변경 직후 고액 거래 여부를 확인합니다.",
        ],
        "actions": [
            "최근 기기 등록 이력과 인증 성공 이력을 함께 확인합니다.",
            "동일 기기의 다른 고객 거래 발생 여부를 확인합니다.",
        ],
        "questions": [
            "고객이 최근 휴대폰 또는 접속 기기를 변경했습니까?",
            "신규 기기 사용 직후 거래 금액 또는 수취인이 달라졌습니까?",
        ],
    },
    "REPEAT_TX": {
        "title": "반복 거래",
        "factor": "짧은 시간 안에 동일 고객 또는 계좌의 반복 거래가 확인되었습니다.",
        "review_points": [
            "단시간 반복 거래의 수취인 동일 여부를 확인합니다.",
            "분할 이체 가능성을 확인합니다.",
            "자동화 또는 비정상 반복 시도 여부를 확인합니다.",
        ],
        "actions": [
            "반복 거래의 수취인, 금액, 발생 간격을 표로 비교합니다.",
            "동일 IP 또는 동일 기기에서 반복 시도가 있었는지 확인합니다.",
        ],
        "questions": [
            "고객이 의도적으로 금액을 나누어 거래할 업무상 사유가 있습니까?",
            "반복 거래 중 실패 또는 취소 이력이 함께 존재합니까?",
        ],
    },
    "ODD_HOUR": {
        "title": "심야 거래",
        "factor": "고객의 일반 이용 시간대와 다를 수 있는 심야 시간대 거래입니다.",
        "review_points": [
            "고객 평소 이용 시간대와 다른지 확인합니다.",
            "심야 거래 직후 추가 거래 발생 여부를 확인합니다.",
            "동일 기기 또는 동일 IP의 반복 거래 여부를 확인합니다.",
        ],
        "actions": [
            "최근 이용 시간대 분포와 해당 거래 시간을 비교합니다.",
            "거래 직후 동일 고객의 추가 거래 발생 여부를 확인합니다.",
        ],
        "questions": [
            "고객이 해당 시간대에 거래할 수밖에 없는 맥락이 확인됩니까?",
            "심야 거래가 반복적으로 나타나는 고객 패턴입니까?",
        ],
    },
    "LOCATION_MISMATCH": {
        "title": "위치 불일치",
        "factor": "거래 위치 또는 IP 기반 위치가 기존 거래 흐름과 다를 수 있습니다.",
        "review_points": [
            "직전 거래 위치와 현재 위치의 이동 가능성을 확인합니다.",
            "IP 기반 위치와 기기 정보의 정합성을 확인합니다.",
            "해외 접속 또는 VPN 가능성을 확인합니다.",
        ],
        "actions": [
            "직전 거래 위치와 시간 차이를 기준으로 이동 가능성을 검토합니다.",
            "접속 IP, 기기 ID, 채널 정보가 함께 변경되었는지 확인합니다.",
        ],
        "questions": [
            "고객의 출장, 여행, 해외 체류 등 위치 변화 사유가 확인됩니까?",
            "VPN 또는 프록시 사용 가능성을 배제할 수 있습니까?",
        ],
    },
}


def create_mock_report(transaction: dict, detection: dict) -> dict:
    requested_provider = os.getenv("PHASE2_AI_PROVIDER", "mock").lower()
    # Step 6 기준: openai 설정이어도 실제 외부 API를 호출하지 않고 mock 리포트를 반환한다.
    provider = "mock"
    provider_notice = _build_provider_notice(requested_provider)

    detected_rules = detection["detected_rules"]
    risk_level = detection["risk_level"]
    tone = RISK_TONE.get(risk_level, RISK_TONE["low"])
    risk_label = detection.get("risk_label") or tone["label"]
    evidence_summary = _build_evidence_summary(transaction, detection)
    risk_factors = _build_risk_factors(detected_rules)
    review_points = _build_review_points(detected_rules)
    recommended_actions = _build_recommended_actions(detected_rules, risk_level)
    customer_context_questions = _build_customer_context_questions(detected_rules)
    limitations = _build_limitations(requested_provider)
    summary = _build_summary(detection, tone, risk_label)

    return {
        "transaction_id": transaction["transaction_id"],
        "provider": provider,
        "provider_requested": requested_provider,
        "provider_notice": provider_notice,
        "report_title": "의심거래 검토 리포트 초안",
        "risk_level": risk_level,
        "risk_label": risk_label,
        "summary": summary,
        "detected_rules": detected_rules,
        "review_points": review_points,
        "risk_factors": risk_factors,
        "recommended_actions": recommended_actions,
        "customer_context_questions": customer_context_questions,
        "evidence_summary": evidence_summary,
        "limitations": limitations,
        "disclaimer": "본 리포트는 담당자 검토를 위한 초안이며, 최종 판단은 담당자가 수행합니다.",
    }


def _build_summary(detection: dict, tone: dict, risk_label: str) -> str:
    detected_rules = detection["detected_rules"]
    if detected_rules:
        rule_text = ", ".join(detected_rules)
        return (
            f"{tone['summary']} 탐지 룰은 {rule_text}이며, "
            f"위험도는 {risk_label}, risk_score는 {detection['risk_score']}점입니다. "
            "이 결과는 의심 가능성을 보조적으로 제시하는 초안이며 거래 차단이나 최종 판단을 자동 수행하지 않습니다."
        )

    return (
        "문서 기준 탐지 룰에 해당하지 않는 정상 후보 거래입니다. "
        "다만 본 리포트는 담당자 검토용 초안이므로 거래 맥락과 고객 이용 패턴을 참고 확인한 뒤 상태를 확정해야 합니다."
    )


def _build_evidence_summary(transaction: dict, detection: dict) -> dict:
    return {
        "amount": f"{transaction['amount']:,} {transaction['currency']}",
        "channel": transaction["channel"],
        "transaction_time": transaction["transaction_time"],
        "location": transaction["location"],
        "device_id": transaction["device_id"],
        "risk_score": detection["risk_score"],
        "review_status": detection["review_status"],
    }


def _build_risk_factors(detected_rules: list[str]) -> list[dict]:
    if not detected_rules:
        return [
            {
                "rule": "NO_RULE_DETECTED",
                "title": "탐지 룰 없음",
                "description": "현재 문서 기준 탐지 룰에는 해당하지 않습니다.",
                "check_points": [
                    "거래 금액, 시간, 채널, 위치가 고객의 일반 이용 패턴과 크게 다르지 않은지 참고 확인합니다."
                ],
            }
        ]

    factors = []
    for rule in detected_rules:
        template = RULE_TEMPLATES.get(rule)
        if template is None:
            factors.append(
                {
                    "rule": rule,
                    "title": rule,
                    "description": "문서에 정의된 탐지 룰에 해당합니다.",
                    "check_points": ["거래 상세와 고객 이용 맥락을 확인합니다."],
                }
            )
            continue

        factors.append(
            {
                "rule": rule,
                "title": template["title"],
                "description": template["factor"],
                "check_points": template["review_points"],
            }
        )
    return factors


def _build_review_points(detected_rules: list[str]) -> list[str]:
    if not detected_rules:
        return ["탐지 룰에 해당하지 않더라도 거래 맥락상 특이사항이 있는지 확인합니다."]

    points: list[str] = []
    for rule in detected_rules:
        template = RULE_TEMPLATES.get(rule)
        if template is None:
            points.append("거래 상세와 고객 이용 맥락을 확인합니다.")
        else:
            points.extend(template["review_points"])
    return _unique(points)


def _build_recommended_actions(detected_rules: list[str], risk_level: str) -> list[str]:
    tone = RISK_TONE.get(risk_level, RISK_TONE["low"])
    actions = [tone["action"]]
    for rule in detected_rules:
        template = RULE_TEMPLATES.get(rule)
        if template:
            actions.extend(template["actions"])
    actions.append("검토 결과에 따라 미확인, 검토중, 정상거래, 의심거래 중 하나로 상태를 기록합니다.")
    return _unique(actions)


def _build_customer_context_questions(detected_rules: list[str]) -> list[str]:
    if not detected_rules:
        return [
            "고객의 최근 거래 목적과 이번 거래가 자연스럽게 연결됩니까?",
            "거래 시간, 위치, 채널이 고객의 일반 이용 패턴과 크게 다르지 않습니까?",
        ]

    questions: list[str] = []
    for rule in detected_rules:
        template = RULE_TEMPLATES.get(rule)
        if template:
            questions.extend(template["questions"])
    return _unique(questions)

def _build_provider_notice(requested_provider: str) -> str:
    if requested_provider == "openai":
        return (
            "PHASE2_AI_PROVIDER=openai가 설정되어 있어도 Step 6에서는 실제 OpenAI 호출이 "
            "활성화되어 있지 않아 mock 리포트를 반환합니다."
        )
    if requested_provider != "mock":
        return "허용되지 않은 provider 값이므로 외부 호출 없이 mock 리포트를 반환합니다."
    return "mock 모드로 외부 API 호출 없이 리포트를 생성했습니다."


def _build_limitations(requested_provider: str) -> list[str]:
    limitations = [
        "mock 리포트는 샘플 데이터와 룰 기반 탐지 결과만 사용하며 외부 API를 호출하지 않습니다.",
        "리포트는 거래 차단, 정상거래 확정, 의심거래 확정을 자동 수행하지 않습니다.",
        "실제 개인정보나 금융거래 민감정보 없이 포트폴리오 검증용 샘플 값을 기준으로 작성됩니다.",
        "최종 판단과 후속 조치는 담당자가 내부 기준에 따라 수행해야 합니다.",
    ]
    if requested_provider == "openai":
        limitations.insert(
            1,
            "openai 모드는 현재 단계에서 실제 호출이 미활성화되어 있으며 사용량 카운터를 차감하지 않습니다.",
        )
    return limitations


def _unique(items: list[str]) -> list[str]:
    return list(dict.fromkeys(items))
