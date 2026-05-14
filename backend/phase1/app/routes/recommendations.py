from fastapi import APIRouter

from app.schemas import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import create_recommendation


router = APIRouter(prefix="/api/phase1", tags=["phase1-recommendations"])


@router.post("/recommendations", response_model=RecommendationResponse)
def recommend_products(request: RecommendationRequest) -> RecommendationResponse:
    # Phase 1에서는 mock 데이터와 mock AI 설명을 조합해 추천 응답을 생성한다.
    return create_recommendation(request)
