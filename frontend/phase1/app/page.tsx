"use client";

import { FormEvent, useMemo, useState } from "react";

import { requestRecommendation } from "@/lib/api";
import type {
  FinancialGoal,
  PreferredInstitution,
  ProductType,
  RecommendationResponse,
} from "@/types/recommendation";

const productTypeOptions: Array<{ value: ProductType; label: string }> = [
  { value: "deposit", label: "예금" },
  { value: "saving", label: "적금" },
  { value: "loan", label: "대출" },
];

const financialGoalOptions: Array<{ value: FinancialGoal; label: string }> = [
  { value: "lump_sum", label: "목돈 마련" },
  { value: "idle_funds", label: "여유자금 예치" },
  { value: "living_expenses", label: "생활자금" },
  { value: "jeonse", label: "전세자금" },
  { value: "emergency", label: "비상금" },
];

const institutionOptions: Array<{ value: PreferredInstitution; label: string }> =
  [
    { value: "bank", label: "은행" },
    { value: "savings_bank", label: "저축은행" },
    { value: "all", label: "전체" },
  ];

const periodOptions = [
  { value: "", label: "미입력" },
  { value: "6", label: "6개월" },
  { value: "12", label: "12개월" },
  { value: "24", label: "24개월" },
  { value: "36", label: "36개월" },
  { value: "60", label: "60개월" },
];

function formatRate(value: number | null) {
  return value === null ? "미제공" : `${value.toFixed(1)}%`;
}

function formatPeriod(value: number | null) {
  return value === null ? "미제공" : `${value}개월`;
}

export default function Home() {
  const [productType, setProductType] = useState<ProductType>("saving");
  const [age, setAge] = useState(29);
  const [amount, setAmount] = useState(500000);
  const [savingPeriodMonths, setSavingPeriodMonths] = useState("12");
  const [financialGoal, setFinancialGoal] =
    useState<FinancialGoal>("lump_sum");
  const [preferredInstitution, setPreferredInstitution] =
    useState<PreferredInstitution>("bank");
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emptyStateMessage = useMemo(() => {
    if (isLoading) {
      return "추천 결과를 생성하는 중입니다.";
    }
    if (!response && !errorMessage) {
      return "조건을 입력하면 추천 결과가 표시됩니다.";
    }
    return null;
  }, [errorMessage, isLoading, response]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setResponse(null);

    try {
      const result = await requestRecommendation({
        product_type: productType,
        age,
        amount,
        saving_period_months: savingPeriodMonths
          ? Number(savingPeriodMonths)
          : null,
        financial_goal: financialGoal,
        preferred_institutions: [preferredInstitution],
      });
      setResponse(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "추천 요청 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Phase 1</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            금융 상품 비교 추천 AI 에이전트
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            예금, 적금, 대출 상품을 입력 조건에 맞춰 비교해 볼 수 있는
            mock 추천 화면입니다. 백엔드의 Phase 1 추천 API와 연결해 요청과
            응답 흐름을 확인합니다.
          </p>
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            본 서비스는 금융상품 탐색을 돕는 참고용 도구입니다. 실제 가입 전
            금융회사와 금융감독원 공시 정보를 확인해 주세요.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">추천 조건 입력</h2>
            <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium">
                상품 유형
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={productType}
                  onChange={(event) =>
                    setProductType(event.target.value as ProductType)
                  }
                >
                  {productTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                나이
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  min={1}
                  type="number"
                  value={age}
                  onChange={(event) => setAge(Number(event.target.value))}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                금액
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  min={1}
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                가입/이용 기간
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={savingPeriodMonths}
                  onChange={(event) => setSavingPeriodMonths(event.target.value)}
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                금융 목적
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={financialGoal}
                  onChange={(event) =>
                    setFinancialGoal(event.target.value as FinancialGoal)
                  }
                >
                  {financialGoalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                선호 금융권역
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={preferredInstitution}
                  onChange={(event) =>
                    setPreferredInstitution(
                      event.target.value as PreferredInstitution,
                    )
                  }
                >
                  {institutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="mt-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "추천 생성 중" : "추천 요청"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">추천 결과</h2>
              {response?.request_id ? (
                <p className="text-xs text-slate-500">
                  request_id: {response.request_id}
                </p>
              ) : null}
            </div>

            {emptyStateMessage ? (
              <p className="mt-6 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
                {emptyStateMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {response ? (
              <div className="mt-6 flex flex-col gap-5">
                {response.status === "partial_success" ? (
                  <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {response.error?.message ||
                      "상품 목록은 확인할 수 있지만, AI 추천 설명을 생성하지 못했습니다."}
                  </div>
                ) : null}

                {response.summary ? (
                  <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                    {response.summary}
                  </p>
                ) : null}

                {response.recommended_products.length === 0 ? (
                  <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
                    현재 조건에 맞는 상품을 찾기 어렵습니다.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {response.recommended_products.map((product) => (
                      <article
                        className="rounded-lg border border-slate-200 p-4"
                        key={`${product.rank}-${product.product_name}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-emerald-700">
                              {product.rank}위 · {product.financial_sector_name}
                            </p>
                            <h3 className="mt-1 text-base font-semibold">
                              {product.product_name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {product.company_name}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {product.product_type}
                          </span>
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                          <div>
                            <dt className="text-slate-500">기본금리</dt>
                            <dd className="font-medium">
                              {formatRate(product.base_rate)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">최고우대금리</dt>
                            <dd className="font-medium">
                              {formatRate(product.max_rate)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">기간</dt>
                            <dd className="font-medium">
                              {formatPeriod(product.period_months)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">가입방법</dt>
                            <dd className="font-medium">
                              {product.join_way || "미제공"}
                            </dd>
                          </div>
                        </dl>

                        {product.recommendation_reason ? (
                          <p className="mt-4 text-sm leading-6 text-slate-700">
                            {product.recommendation_reason}
                          </p>
                        ) : null}

                        {product.cautions.length > 0 ? (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                            {product.cautions.map((caution) => (
                              <li key={caution}>{caution}</li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}

                {response.comparison_points.length > 0 ? (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold">비교 포인트</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {response.comparison_points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <p className="rounded-lg border border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500">
                  {response.disclaimer}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
