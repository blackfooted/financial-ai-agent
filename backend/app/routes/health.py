from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    # Phase 1 백엔드 프로세스가 정상 실행 중인지 확인한다.
    return {
        "status": "ok",
        "service": "financial-ai-agent-phase1",
    }
