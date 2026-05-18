from __future__ import annotations

from datetime import datetime

from app.services.phase2.detection_service import RISK_LABELS, detect_transactions


ALLOWED_REVIEW_STATUSES = {"미확인", "검토중", "정상거래", "의심거래"}

_ANALYSIS_RESULTS: dict[str, dict] = {}
_ANALYSIS_ID: str | None = None


SAMPLE_TRANSACTIONS = [
    {
        "id": "tx-row-001",
        "transaction_id": "TX202605180001",
        "customer_id": "CUST-1001",
        "account_id": "ACC-2001",
        "transaction_type": "transfer",
        "amount": 50000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1001-A",
        "ip_address": "192.0.2.10",
        "location": "Seoul",
        "transaction_time": "2026-05-18T09:30:00+09:00",
        "created_at": "2026-05-18T09:31:00+09:00",
    },
    {
        "id": "tx-row-002",
        "transaction_id": "TX202605180002",
        "customer_id": "CUST-1002",
        "account_id": "ACC-2002",
        "transaction_type": "transfer",
        "amount": 3200000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1002-A",
        "ip_address": "192.0.2.11",
        "location": "Seoul",
        "transaction_time": "2026-05-18T10:00:00+09:00",
        "created_at": "2026-05-18T10:01:00+09:00",
    },
    {
        "id": "tx-row-003",
        "transaction_id": "TX202605180003",
        "customer_id": "CUST-1003",
        "account_id": "ACC-2003",
        "transaction_type": "transfer",
        "amount": 120000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-NEW-1003",
        "ip_address": "192.0.2.12",
        "location": "Busan",
        "transaction_time": "2026-05-18T11:00:00+09:00",
        "created_at": "2026-05-18T11:01:00+09:00",
    },
    {
        "id": "tx-row-004",
        "transaction_id": "TX202605180004",
        "customer_id": "CUST-1004",
        "account_id": "ACC-2004",
        "transaction_type": "transfer",
        "amount": 70000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1004-A",
        "ip_address": "192.0.2.13",
        "location": "Seoul",
        "transaction_time": "2026-05-18T12:00:00+09:00",
        "created_at": "2026-05-18T12:01:00+09:00",
    },
    {
        "id": "tx-row-005",
        "transaction_id": "TX202605180005",
        "customer_id": "CUST-1004",
        "account_id": "ACC-2004",
        "transaction_type": "transfer",
        "amount": 80000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1004-A",
        "ip_address": "192.0.2.13",
        "location": "Seoul",
        "transaction_time": "2026-05-18T12:04:00+09:00",
        "created_at": "2026-05-18T12:05:00+09:00",
    },
    {
        "id": "tx-row-006",
        "transaction_id": "TX202605180006",
        "customer_id": "CUST-1004",
        "account_id": "ACC-2004",
        "transaction_type": "transfer",
        "amount": 90000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1004-A",
        "ip_address": "192.0.2.13",
        "location": "Seoul",
        "transaction_time": "2026-05-18T12:08:00+09:00",
        "created_at": "2026-05-18T12:09:00+09:00",
    },
    {
        "id": "tx-row-007",
        "transaction_id": "TX202605180007",
        "customer_id": "CUST-1005",
        "account_id": "ACC-2005",
        "transaction_type": "transfer",
        "amount": 150000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1005-A",
        "ip_address": "192.0.2.14",
        "location": "Incheon",
        "transaction_time": "2026-05-18T02:20:00+09:00",
        "created_at": "2026-05-18T02:21:00+09:00",
    },
    {
        "id": "tx-row-008",
        "transaction_id": "TX202605180008",
        "customer_id": "CUST-1006",
        "account_id": "ACC-2006",
        "transaction_type": "transfer",
        "amount": 200000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1006-A",
        "ip_address": "192.0.2.15",
        "location": "Seoul",
        "transaction_time": "2026-05-18T13:00:00+09:00",
        "created_at": "2026-05-18T13:01:00+09:00",
    },
    {
        "id": "tx-row-009",
        "transaction_id": "TX202605180009",
        "customer_id": "CUST-1006",
        "account_id": "ACC-2006",
        "transaction_type": "transfer",
        "amount": 210000,
        "currency": "KRW",
        "channel": "web",
        "device_id": "DEV-1006-A",
        "ip_address": "198.51.100.20",
        "location": "Singapore",
        "transaction_time": "2026-05-18T13:40:00+09:00",
        "created_at": "2026-05-18T13:41:00+09:00",
    },
    {
        "id": "tx-row-010",
        "transaction_id": "TX202605180010",
        "customer_id": "CUST-1007",
        "account_id": "ACC-2007",
        "transaction_type": "transfer",
        "amount": 3500000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-NEW-1007",
        "ip_address": "203.0.113.10",
        "location": "Seoul",
        "transaction_time": "2026-05-18T14:00:00+09:00",
        "created_at": "2026-05-18T14:01:00+09:00",
    },
    {
        "id": "tx-row-011",
        "transaction_id": "TX202605180011",
        "customer_id": "CUST-1008",
        "account_id": "ACC-2008",
        "transaction_type": "transfer",
        "amount": 60000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1008-A",
        "ip_address": "192.0.2.16",
        "location": "Daegu",
        "transaction_time": "2026-05-18T01:00:00+09:00",
        "created_at": "2026-05-18T01:01:00+09:00",
    },
    {
        "id": "tx-row-012",
        "transaction_id": "TX202605180012",
        "customer_id": "CUST-1008",
        "account_id": "ACC-2008",
        "transaction_type": "transfer",
        "amount": 65000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1008-A",
        "ip_address": "192.0.2.16",
        "location": "Daegu",
        "transaction_time": "2026-05-18T01:04:00+09:00",
        "created_at": "2026-05-18T01:05:00+09:00",
    },
    {
        "id": "tx-row-013",
        "transaction_id": "TX202605180013",
        "customer_id": "CUST-1008",
        "account_id": "ACC-2008",
        "transaction_type": "transfer",
        "amount": 70000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1008-A",
        "ip_address": "192.0.2.16",
        "location": "Daegu",
        "transaction_time": "2026-05-18T01:08:00+09:00",
        "created_at": "2026-05-18T01:09:00+09:00",
    },
    {
        "id": "tx-row-014",
        "transaction_id": "TX202605180014",
        "customer_id": "CUST-1009",
        "account_id": "ACC-2009",
        "transaction_type": "transfer",
        "amount": 4500000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-NEW-1009",
        "ip_address": "198.51.100.21",
        "location": "Tokyo",
        "transaction_time": "2026-05-18T15:00:00+09:00",
        "created_at": "2026-05-18T15:01:00+09:00",
    },
    {
        "id": "tx-row-015",
        "transaction_id": "TX202605180015",
        "customer_id": "CUST-1009",
        "account_id": "ACC-2009",
        "transaction_type": "transfer",
        "amount": 100000,
        "currency": "KRW",
        "channel": "web",
        "device_id": "DEV-1009-A",
        "ip_address": "192.0.2.17",
        "location": "Seoul",
        "transaction_time": "2026-05-18T15:30:00+09:00",
        "created_at": "2026-05-18T15:31:00+09:00",
    },
    {
        "id": "tx-row-016",
        "transaction_id": "TX202605180016",
        "customer_id": "CUST-1010",
        "account_id": "ACC-2010",
        "transaction_type": "card_payment",
        "amount": 25000,
        "currency": "KRW",
        "channel": "card",
        "device_id": "DEV-1010-A",
        "ip_address": "192.0.2.18",
        "location": "Seoul",
        "transaction_time": "2026-05-18T16:00:00+09:00",
        "created_at": "2026-05-18T16:01:00+09:00",
    },
    {
        "id": "tx-row-017",
        "transaction_id": "TX202605180017",
        "customer_id": "CUST-1011",
        "account_id": "ACC-2011",
        "transaction_type": "transfer",
        "amount": 3000000,
        "currency": "KRW",
        "channel": "web",
        "device_id": "DEV-1011-A",
        "ip_address": "192.0.2.19",
        "location": "Busan",
        "transaction_time": "2026-05-18T17:00:00+09:00",
        "created_at": "2026-05-18T17:01:00+09:00",
    },
    {
        "id": "tx-row-018",
        "transaction_id": "TX202605180018",
        "customer_id": "CUST-1012",
        "account_id": "ACC-2012",
        "transaction_type": "transfer",
        "amount": 500000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-NEW-1012",
        "ip_address": "203.0.113.11",
        "location": "London",
        "transaction_time": "2026-05-18T03:00:00+09:00",
        "created_at": "2026-05-18T03:01:00+09:00",
    },
    {
        "id": "tx-row-019",
        "transaction_id": "TX202605180019",
        "customer_id": "CUST-1001",
        "account_id": "ACC-2001",
        "transaction_type": "transfer",
        "amount": 120000,
        "currency": "KRW",
        "channel": "mobile",
        "device_id": "DEV-1001-A",
        "ip_address": "192.0.2.10",
        "location": "Seoul",
        "transaction_time": "2026-05-18T18:00:00+09:00",
        "created_at": "2026-05-18T18:01:00+09:00",
    },
    {
        "id": "tx-row-020",
        "transaction_id": "TX202605180020",
        "customer_id": "CUST-1002",
        "account_id": "ACC-2002",
        "transaction_type": "card_payment",
        "amount": 45000,
        "currency": "KRW",
        "channel": "card",
        "device_id": "DEV-1002-A",
        "ip_address": "192.0.2.11",
        "location": "Seoul",
        "transaction_time": "2026-05-18T19:00:00+09:00",
        "created_at": "2026-05-18T19:01:00+09:00",
    },
]


def analyze_transactions(data_source: str, requested_by: str | None = None) -> dict:
    if data_source != "sample":
        raise ValueError("PHASE2_INVALID_DATA_SOURCE")

    global _ANALYSIS_ID
    _ANALYSIS_ID = f"analysis-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    _refresh_analysis_results()

    risk_summary = {"low": 0, "medium": 0, "high": 0}
    detected_count = 0
    for detection in _ANALYSIS_RESULTS.values():
        risk_summary[detection["risk_level"]] += 1
        if detection["detected_rules"]:
            detected_count += 1

    return {
        "analysis_id": _ANALYSIS_ID,
        "requested_by": requested_by,
        "total_count": len(SAMPLE_TRANSACTIONS),
        "detected_count": detected_count,
        "risk_summary": risk_summary,
        "display_labels": RISK_LABELS,
    }


def list_transactions(risk_level: str | None = None, review_status: str | None = None) -> list[dict]:
    _ensure_analysis_results()
    items = []
    for transaction in SAMPLE_TRANSACTIONS:
        detection = _ANALYSIS_RESULTS[transaction["id"]]
        if risk_level and detection["risk_level"] != risk_level:
            continue
        if review_status and detection["review_status"] != review_status:
            continue
        items.append(
            {
                "id": transaction["id"],
                "transaction_id": transaction["transaction_id"],
                "customer_id": transaction["customer_id"],
                "amount": transaction["amount"],
                "currency": transaction["currency"],
                "channel": transaction["channel"],
                "transaction_time": transaction["transaction_time"],
                "risk_level": detection["risk_level"],
                "risk_label": detection["risk_label"],
                "risk_score": detection["risk_score"],
                "review_status": detection["review_status"],
            }
        )
    return items


def get_transaction_detail(transaction_id: str) -> dict | None:
    _ensure_analysis_results()
    transaction = _find_transaction(transaction_id)
    if transaction is None:
        return None
    return {
        "transaction": transaction,
        "detection": _ANALYSIS_RESULTS[transaction["id"]],
    }


def update_review_status(transaction_id: str, review_status: str, reviewed_by: str | None) -> dict | None:
    if review_status not in ALLOWED_REVIEW_STATUSES:
        raise ValueError("PHASE2_INVALID_STATUS")

    _ensure_analysis_results()
    transaction = _find_transaction(transaction_id)
    if transaction is None:
        return None

    now = datetime.now().astimezone().isoformat(timespec="seconds")
    detection = _ANALYSIS_RESULTS[transaction["id"]]
    detection["review_status"] = review_status
    detection["reviewed_by"] = reviewed_by
    detection["reviewed_at"] = now
    detection["updated_at"] = now
    return {
        "id": detection["id"],
        "transaction_id": detection["transaction_id"],
        "review_status": detection["review_status"],
        "reviewed_by": detection["reviewed_by"],
        "reviewed_at": detection["reviewed_at"],
        "updated_at": detection["updated_at"],
    }


def get_detection_for_report(transaction_id: str) -> tuple[dict, dict] | None:
    detail = get_transaction_detail(transaction_id)
    if detail is None:
        return None
    return detail["transaction"], detail["detection"]


def _ensure_analysis_results() -> None:
    if not _ANALYSIS_RESULTS:
        _refresh_analysis_results()


def _refresh_analysis_results() -> None:
    existing_reviews = {
        transaction_id: {
            "review_status": detection.get("review_status", "미확인"),
            "reviewed_by": detection.get("reviewed_by"),
            "reviewed_at": detection.get("reviewed_at"),
            "created_at": detection.get("created_at"),
            "updated_at": detection.get("updated_at"),
        }
        for transaction_id, detection in _ANALYSIS_RESULTS.items()
    }
    _ANALYSIS_RESULTS.clear()
    _ANALYSIS_RESULTS.update(detect_transactions(SAMPLE_TRANSACTIONS, existing_reviews))


def _find_transaction(transaction_id: str) -> dict | None:
    return next((transaction for transaction in SAMPLE_TRANSACTIONS if transaction["id"] == transaction_id), None)

