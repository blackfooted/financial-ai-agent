from __future__ import annotations

import json
import logging
from datetime import date
from pathlib import Path
from typing import Any

from app.config import OPENAI_DAILY_LIMIT


USAGE_DIR = Path(__file__).resolve().parents[1] / "data" / "usage"
USAGE_FILE = USAGE_DIR / "openai_daily_usage.json"


class OpenAIDailyLimitExceededError(Exception):
    pass


def get_openai_daily_usage() -> dict[str, Any]:
    usage = _load_usage_for_today()
    return {
        "date": usage["date"],
        "count": usage["count"],
        "limit": OPENAI_DAILY_LIMIT,
        "remaining": max(OPENAI_DAILY_LIMIT - usage["count"], 0),
    }


def reserve_openai_daily_usage(*, limit: int) -> dict[str, Any]:
    # Phase 1 MVP uses a file counter. It is not strict for concurrency and
    # may reset on ephemeral hosting restarts; production should use Redis/DB/KV.
    usage = _load_usage_for_today()
    if usage["count"] >= limit:
        raise OpenAIDailyLimitExceededError("오늘 OpenAI 추천 호출 가능 횟수를 초과했습니다.")

    usage["count"] += 1
    _save_usage(usage)

    return {
        "date": usage["date"],
        "count": usage["count"],
        "limit": limit,
        "remaining": max(limit - usage["count"], 0),
    }


def _today() -> str:
    return date.today().isoformat()


def _empty_usage() -> dict[str, Any]:
    return {
        "date": _today(),
        "count": 0,
    }


def _load_usage_for_today() -> dict[str, Any]:
    if not USAGE_FILE.exists():
        return _empty_usage()

    try:
        with USAGE_FILE.open("r", encoding="utf-8") as file:
            payload = json.load(file)
    except (OSError, json.JSONDecodeError):
        logging.warning("OpenAI usage file is invalid. Resetting today's usage.")
        return _empty_usage()

    if not isinstance(payload, dict):
        logging.warning("OpenAI usage file has invalid structure. Resetting today's usage.")
        return _empty_usage()

    usage_date = payload.get("date")
    count = payload.get("count")
    if usage_date != _today() or not isinstance(count, int) or count < 0:
        return _empty_usage()

    return {
        "date": usage_date,
        "count": count,
    }


def _save_usage(usage: dict[str, Any]) -> None:
    USAGE_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "date": usage["date"],
        "count": usage["count"],
    }
    with USAGE_FILE.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
