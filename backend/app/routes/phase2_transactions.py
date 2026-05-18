from typing import Literal

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.phase2.report_service import create_mock_report
from app.services.phase2.transaction_service import (
    ALLOWED_REVIEW_STATUSES,
    analyze_transactions,
    get_detection_for_report,
    get_transaction_detail,
    list_transactions,
    update_review_status,
)


router = APIRouter(prefix="/api/phase2/transactions", tags=["phase2-transactions"])


class AnalyzeRequest(BaseModel):
    data_source: Literal["sample", "real"] = "sample"
    requested_by: str | None = None


class UpdateStatusRequest(BaseModel):
    review_status: str
    reviewed_by: str | None = None


@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    try:
        data = analyze_transactions(request.data_source, request.requested_by)
    except ValueError as exc:
        if str(exc) == "PHASE2_INVALID_DATA_SOURCE":
            return _error_response(
                "PHASE2_INVALID_DATA_SOURCE",
                "현재 Phase 2 mock API는 sample 데이터 소스만 지원합니다.",
                status_code=400,
            )
        raise

    return {
        "success": True,
        "data": data,
        "message": "거래 데이터 분석이 완료되었습니다.",
    }


@router.get("")
def get_transactions(
    risk_level: Literal["low", "medium", "high"] | None = None,
    review_status: str | None = Query(default=None),
):
    if review_status is not None and review_status not in ALLOWED_REVIEW_STATUSES:
        return _error_response("PHASE2_INVALID_STATUS", "허용되지 않는 review_status 값입니다.", status_code=400)

    data = list_transactions(risk_level=risk_level, review_status=review_status)
    return {
        "success": True,
        "data": data,
        "meta": {
            "total": len(data),
            "page": 1,
            "page_size": len(data),
        },
        "message": "거래 목록을 조회했습니다.",
    }


@router.get("/{id}")
def get_transaction(id: str):
    detail = get_transaction_detail(id)
    if detail is None:
        return _transaction_not_found()
    return {
        "success": True,
        "data": detail,
        "message": "거래 상세를 조회했습니다.",
    }


@router.patch("/{id}/status")
def patch_transaction_status(id: str, request: UpdateStatusRequest):
    try:
        data = update_review_status(id, request.review_status, request.reviewed_by)
    except ValueError as exc:
        if str(exc) == "PHASE2_INVALID_STATUS":
            return _error_response("PHASE2_INVALID_STATUS", "허용되지 않는 review_status 값입니다.", status_code=400)
        raise

    if data is None:
        return _transaction_not_found()
    return {
        "success": True,
        "data": data,
        "message": "검토 상태가 변경되었습니다.",
    }


@router.get("/{id}/report")
def get_transaction_report(id: str):
    report_source = get_detection_for_report(id)
    if report_source is None:
        return _transaction_not_found()

    transaction, detection = report_source
    return {
        "success": True,
        "data": create_mock_report(transaction, detection),
        "message": "리포트 초안을 조회했습니다.",
    }


def _transaction_not_found() -> JSONResponse:
    return _error_response("PHASE2_TRANSACTION_NOT_FOUND", "요청한 거래를 찾을 수 없습니다.", status_code=404)


def _error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
            },
        },
    )

