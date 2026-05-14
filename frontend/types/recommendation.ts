export type ProductType = "deposit" | "saving" | "loan";

export type FinancialGoal =
  | "lump_sum"
  | "idle_funds"
  | "living_expenses"
  | "jeonse"
  | "emergency";

export type PreferredInstitution = "bank" | "savings_bank" | "all";

export interface RecommendationRequest {
  product_type: ProductType;
  age: number;
  amount: number;
  saving_period_months?: number | null;
  financial_goal: FinancialGoal;
  preferred_institutions: PreferredInstitution[];
}

export interface RecommendedProduct {
  rank: number;
  company_name: string;
  financial_sector: string;
  financial_sector_name: string;
  top_fin_grp_no: string | null;
  product_name: string;
  product_type: ProductType;
  base_rate: number | null;
  max_rate: number | null;
  period_months: number | null;
  join_way: string | null;
  recommendation_reason: string | null;
  cautions: string[];
}

export interface RecommendationResponse {
  request_id: string;
  product_type: ProductType;
  status: "success" | "partial_success" | "error";
  summary: string | null;
  recommended_products: RecommendedProduct[];
  comparison_points: string[];
  disclaimer: string;
  source: {
    provider: string;
    fetched_at: string;
    cache_used?: boolean | null;
  } | null;
  error: {
    error_code: string;
    message: string;
  } | null;
}
