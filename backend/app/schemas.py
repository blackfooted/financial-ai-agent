"""Phase 1 API 요청/응답 스키마 정의 모듈."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator


ProductType = Literal["deposit", "saving", "loan"]
FinancialGoal = Literal[
    "lump_sum",
    "idle_funds",
    "living_expenses",
    "jeonse",
    "emergency",
]
PreferredInstitution = Literal["bank", "savings_bank", "all"]
ResponseStatus = Literal["success", "partial_success", "error"]


class RecommendationRequest(BaseModel):
    product_type: ProductType
    age: int = Field(gt=0)
    amount: float = Field(gt=0)
    saving_period_months: int | None = Field(default=None, gt=0)
    financial_goal: FinancialGoal
    preferred_institutions: list[PreferredInstitution] = Field(default_factory=lambda: ["bank"])

    @field_validator("preferred_institutions", mode="before")
    @classmethod
    def default_preferred_institutions(cls, value):
        # 누락되거나 빈 배열이면 Phase 1 기본값인 은행권으로 처리한다.
        if value is None or value == []:
            return ["bank"]
        return value


class RecommendedProduct(BaseModel):
    rank: int
    company_name: str
    financial_sector: str
    financial_sector_name: str
    top_fin_grp_no: str | None
    product_name: str
    product_type: str
    base_rate: float | None
    max_rate: float | None
    period_months: int | None
    join_way: str | None
    recommendation_reason: str | None
    cautions: list[str]


class RecommendationSource(BaseModel):
    provider: str
    fetched_at: str
    cache_used: bool | None


class RecommendationError(BaseModel):
    error_code: str
    message: str


class RecommendationResponse(BaseModel):
    request_id: str
    product_type: str
    status: ResponseStatus
    summary: str | None
    recommended_products: list[RecommendedProduct]
    comparison_points: list[str]
    disclaimer: str
    source: RecommendationSource | None
    error: RecommendationError | None
