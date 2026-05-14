"use client";

import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
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

const productTypeLabelMap: Record<ProductType, string> = {
  deposit: "예금",
  saving: "적금",
  loan: "대출",
};

const currencyFormatter = new Intl.NumberFormat("ko-KR");

function formatRate(value: number | null) {
  return value === null ? "미제공" : `${value.toFixed(1)}%`;
}

function formatPeriod(value: number | null) {
  return value === null ? "미제공" : `${value}개월`;
}

function calculateInterest(
  amount: number,
  rate: number | null,
  periodMonths: number | null,
) {
  if (!amount || rate === null || periodMonths === null) {
    return null;
  }

  return Math.round(amount * (rate / 100) * (periodMonths / 12));
}

function getInterestLabel(productType: ProductType) {
  if (productType === "deposit") {
    return "예상 이자";
  }
  if (productType === "loan") {
    return "단순 예상 이자 부담";
  }
  return "단순 예상 이자";
}

function getInterestNotice(productType: ProductType) {
  if (productType === "loan") {
    return "실제 상환액은 상환 방식, 기간, 심사 결과에 따라 달라질 수 있습니다.";
  }
  return "우대조건 충족 여부, 세금, 상품 조건에 따라 실제 이자는 달라질 수 있습니다.";
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

  const statusMessage = useMemo(() => {
    if (isLoading) {
      return "추천 결과를 생성하는 중입니다.";
    }
    if (errorMessage) {
      return errorMessage;
    }
    if (response?.status === "partial_success") {
      return "상품 목록은 표시되었지만 AI 추천 설명 일부를 생성하지 못했습니다.";
    }
    if (response) {
      return "추천 결과를 확인해 주세요.";
    }
    return "조건을 입력하면 추천 결과가 표시됩니다.";
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
          : "추천 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const statusClassName = errorMessage
    ? "border-red-200 bg-red-50 text-red-700"
    : response?.status === "partial_success"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : response
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-emerald-700">Phase 1</p>
            <h2 className="text-xl font-semibold tracking-tight">
              추천 조건 입력
            </h2>
            <p className="text-sm text-slate-600">
              필수 항목을 입력하면 mock 추천 API를 호출합니다.
            </p>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              상품 유형 <span className="sr-only">필수</span>
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
                나이
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  min={1}
                  required
                  type="number"
                  value={age}
                  onChange={(event) => setAge(Number(event.target.value))}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
                금액
                <div className="flex rounded-md border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input
                    className="min-w-0 flex-1 rounded-l-md px-3 py-2 text-sm outline-none"
                    min={1}
                    placeholder="500000 (오십만 원)"
                    required
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                  />
                  <span className="flex items-center border-l border-slate-200 px-3 text-sm text-slate-500">
                    원
                  </span>
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              가입/이용 기간
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              금융 목적
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
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

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              선호 금융권역
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
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
              className="mt-2 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "추천 생성 중" : "추천 요청"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">추천 결과</h2>

          <p
            className={`mt-5 rounded-md border px-4 py-3 text-sm ${statusClassName}`}
          >
            {statusMessage}
          </p>

          {response ? (
            <div className="mt-6 flex flex-col gap-5">
              {response.summary ? (
                <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  {response.summary}
                </p>
              ) : null}

              {response.recommended_products.length === 0 ? (
                <p className="rounded-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
                  현재 조건에 맞는 상품을 찾기 어렵습니다.
                  <br />
                  가입 기간이나 금융권역 조건을 바꿔 다시 시도해 보세요.
                </p>
              ) : (
                <div className="grid gap-4">
                  {response.recommended_products.map((product) => {
                    const baseInterest = calculateInterest(
                      amount,
                      product.base_rate,
                      product.period_months,
                    );
                    const maxInterest = calculateInterest(
                      amount,
                      product.max_rate,
                      product.period_months,
                    );
                    const interestLabel = getInterestLabel(
                      product.product_type,
                    );

                    return (
                      <article
                        className="rounded-lg border border-slate-200 p-4"
                        key={`${product.rank}-${product.product_name}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-emerald-700">
                              {product.rank}위
                            </p>
                            <h3 className="mt-1 text-base font-semibold">
                              {product.product_name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {product.company_name} ·{" "}
                              {product.financial_sector_name}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {productTypeLabelMap[product.product_type]}
                          </span>
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
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
                            <dt className="text-slate-500">가입/이용 기간</dt>
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

                        {baseInterest !== null || maxInterest !== null ? (
                          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                            <h4 className="font-semibold">
                              참고용 이자 계산
                            </h4>
                            <div className="mt-2 space-y-1 text-slate-700">
                              {baseInterest !== null ? (
                                <p>
                                  {interestLabel}(기본금리 기준): 약{" "}
                                  {currencyFormatter.format(baseInterest)}원
                                </p>
                              ) : null}
                              {maxInterest !== null ? (
                                <p>
                                  {interestLabel}(최고우대금리 기준): 약{" "}
                                  {currencyFormatter.format(maxInterest)}원
                                </p>
                              ) : null}
                            </div>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              단순 참고용 계산이며{" "}
                              {getInterestNotice(product.product_type)}
                            </p>
                          </div>
                        ) : null}

                        {product.recommendation_reason ? (
                          <div className="mt-4 rounded-md bg-slate-50 px-4 py-3">
                            <h4 className="text-sm font-semibold">추천 사유</h4>
                            <p className="mt-1 text-sm leading-6 text-slate-700">
                              {product.recommendation_reason}
                            </p>
                          </div>
                        ) : null}

                        {product.cautions.length > 0 ? (
                          <div className="mt-3 rounded-md border border-amber-100 bg-amber-50 px-4 py-3">
                            <h4 className="text-sm font-semibold text-amber-950">
                              유의사항
                            </h4>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                              {product.cautions.map((caution) => (
                                <li key={caution}>{caution}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}

              {response.comparison_points.length > 0 ? (
                <div className="rounded-md bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold">비교 포인트</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {response.comparison_points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p className="rounded-md border border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500">
                {response.disclaimer}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
