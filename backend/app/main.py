from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Phase 1 MVP에서는 shared 모듈 import를 위해 Repo 루트를 sys.path에 추가한다.
# 후속 패키징 단계에서는 더 정식 구조로 개선할 수 있다.
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.append(str(REPO_ROOT))

from app.config import ALLOWED_ORIGINS, APP_ENV
from app.routes.health import router as health_router
from app.routes.recommendations import router as recommendations_router


app = FastAPI(
    title="Financial AI Agent - Phase 1",
    version="0.1.0",
)

# 개발 환경에서는 로컬 프론트엔드만 허용한다.
if APP_ENV == "local":
    allow_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
else:
    # MVP 배포 초기에는 ALLOWED_ORIGINS가 없으면 임시 전체 허용한다.
    # 실제 배포 도메인이 확정되면 반드시 허용 origin을 좁힌다.
    allow_origins = ALLOWED_ORIGINS or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(recommendations_router)
