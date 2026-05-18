from __future__ import annotations

from datetime import datetime, timedelta


RULE_HIGH_AMOUNT = "HIGH_AMOUNT"
RULE_NEW_DEVICE = "NEW_DEVICE"
RULE_REPEAT_TX = "REPEAT_TX"
RULE_ODD_HOUR = "ODD_HOUR"
RULE_LOCATION_MISMATCH = "LOCATION_MISMATCH"

RISK_LABELS = {
    "low": "하",
    "medium": "중",
    "high": "상",
}

KNOWN_CUSTOMER_DEVICES = {
    "CUST-1001": {"DEV-1001-A"},
    "CUST-1002": {"DEV-1002-A"},
    "CUST-1003": {"DEV-1003-A"},
    "CUST-1004": {"DEV-1004-A"},
    "CUST-1005": {"DEV-1005-A"},
    "CUST-1006": {"DEV-1006-A"},
    "CUST-1007": {"DEV-1007-A"},
    "CUST-1008": {"DEV-1008-A"},
    "CUST-1009": {"DEV-1009-A"},
    "CUST-1010": {"DEV-1010-A"},
    "CUST-1011": {"DEV-1011-A"},
    "CUST-1012": {"DEV-1012-A"},
}

LOCATION_COUNTRIES = {
    "Seoul": "KR",
    "Busan": "KR",
    "Incheon": "KR",
    "Daegu": "KR",
    "Tokyo": "JP",
    "Singapore": "SG",
    "New York": "US",
    "London": "GB",
}


def detect_transactions(transactions: list[dict], existing_reviews: dict[str, dict] | None = None) -> dict[str, dict]:
    existing_reviews = existing_reviews or {}
    return {
        transaction["id"]: detect_transaction(transaction, transactions, existing_reviews.get(transaction["id"]))
        for transaction in transactions
    }


def detect_transaction(transaction: dict, all_transactions: list[dict], existing_review: dict | None = None) -> dict:
    detected_rules = _detect_rules(transaction, all_transactions)
    risk_score = calculate_risk_score(detected_rules)
    risk_level = map_risk_level(risk_score)
    now = _now()
    review = existing_review or {}

    return {
        "id": f"det-{transaction['id'].replace('tx-row-', '')}",
        "transaction_id": transaction["transaction_id"],
        "detected_rules": detected_rules,
        "risk_level": risk_level,
        "risk_label": RISK_LABELS[risk_level],
        "risk_score": risk_score,
        "reason_summary": build_reason_summary(detected_rules),
        "review_status": review.get("review_status", "미확인"),
        "reviewed_by": review.get("reviewed_by"),
        "reviewed_at": review.get("reviewed_at"),
        "created_at": review.get("created_at", now),
        "updated_at": review.get("updated_at", now),
    }


def calculate_risk_score(detected_rules: list[str]) -> int:
    if not detected_rules:
        return 0

    score = 30 + max(len(detected_rules) - 1, 0) * 20
    if RULE_HIGH_AMOUNT in detected_rules:
        score += 10
    if RULE_NEW_DEVICE in detected_rules:
        score += 10

    return min(score, 100)


def map_risk_level(risk_score: int) -> str:
    if risk_score >= 80:
        return "high"
    if risk_score >= 50:
        return "medium"
    return "low"


def build_reason_summary(detected_rules: list[str]) -> str:
    if not detected_rules:
        return "문서 기준 탐지 룰에 해당하지 않는 정상 후보 거래입니다."

    messages = {
        RULE_HIGH_AMOUNT: "고액 거래",
        RULE_NEW_DEVICE: "신규 기기 사용",
        RULE_REPEAT_TX: "단시간 반복 거래",
        RULE_ODD_HOUR: "심야 시간대 거래",
        RULE_LOCATION_MISMATCH: "위치 불일치",
    }
    reasons = [messages[rule] for rule in detected_rules]
    return f"{', '.join(reasons)}가 확인되었습니다."


def _detect_rules(transaction: dict, all_transactions: list[dict]) -> list[str]:
    rules = []
    if transaction["amount"] >= 3_000_000:
        rules.append(RULE_HIGH_AMOUNT)
    if _is_new_device(transaction):
        rules.append(RULE_NEW_DEVICE)
    if _is_repeat_transaction(transaction, all_transactions):
        rules.append(RULE_REPEAT_TX)
    if _is_odd_hour(transaction):
        rules.append(RULE_ODD_HOUR)
    if _has_location_mismatch(transaction, all_transactions):
        rules.append(RULE_LOCATION_MISMATCH)
    return rules


def _is_new_device(transaction: dict) -> bool:
    known_devices = KNOWN_CUSTOMER_DEVICES.get(transaction["customer_id"], set())
    return transaction["device_id"] not in known_devices


def _is_repeat_transaction(transaction: dict, all_transactions: list[dict]) -> bool:
    current_time = _parse_time(transaction["transaction_time"])
    window_start = current_time - timedelta(minutes=10)
    window_end = current_time + timedelta(minutes=10)
    same_customer_count = sum(
        1
        for candidate in all_transactions
        if candidate["customer_id"] == transaction["customer_id"]
        and window_start <= _parse_time(candidate["transaction_time"]) <= window_end
    )
    return same_customer_count >= 3


def _is_odd_hour(transaction: dict) -> bool:
    transaction_time = _parse_time(transaction["transaction_time"])
    return 0 <= transaction_time.hour < 5


def _has_location_mismatch(transaction: dict, all_transactions: list[dict]) -> bool:
    current_time = _parse_time(transaction["transaction_time"])
    current_country = LOCATION_COUNTRIES.get(transaction["location"])
    if current_country is None:
        return False

    for candidate in all_transactions:
        if candidate["id"] == transaction["id"] or candidate["customer_id"] != transaction["customer_id"]:
            continue
        candidate_time = _parse_time(candidate["transaction_time"])
        candidate_country = LOCATION_COUNTRIES.get(candidate["location"])
        if candidate_country and candidate_country != current_country and abs(current_time - candidate_time) <= timedelta(hours=1):
            return True
    return False


def _parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")

