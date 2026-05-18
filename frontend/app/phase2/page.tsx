"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { PhaseNav } from "@/components/PhaseNav";
import { ReportCard, type Phase2Report } from "@/components/phase2/ReportCard";
import { ReviewStatusButton } from "@/components/phase2/ReviewStatusButton";
import {
  TransactionTable,
  type TransactionListItem,
} from "@/components/phase2/TransactionTable";
import { RiskBadge, type RiskLevel } from "@/components/phase2/RiskBadge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
  meta?: {
    total?: number;
  };
};

type AnalyzeSummary = {
  analysis_id: string;
  requested_by?: string | null;
  total_count: number;
  detected_count: number;
  risk_summary: Record<RiskLevel, number>;
};

type TransactionDetail = {
  transaction: {
    id: string;
    transaction_id: string;
    customer_id: string;
    account_id: string;
    transaction_type: string;
    amount: number;
    currency: string;
    channel: string;
    device_id: string;
    ip_address: string;
    location: string;
    transaction_time: string;
    created_at: string;
  };
  detection: {
    id: string;
    transaction_id: string;
    detected_rules: string[];
    risk_level: RiskLevel;
    risk_score: number;
    reason_summary: string;
    review_status: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    updated_at: string;
  };
};

type RiskFilter = "all" | RiskLevel;
type ReviewStatusFilter = "전체" | "미확인" | "검토중" | "정상거래" | "의심거래";
type DateFilter = string;

const riskFilterOptions: Array<{ label: string; value: RiskFilter }> = [
  { label: "전체", value: "all" },
  { label: "하", value: "low" },
  { label: "중", value: "medium" },
  { label: "상", value: "high" },
];

const reviewStatusOptions: ReviewStatusFilter[] = [
  "전체",
  "미확인",
  "검토중",
  "정상거래",
  "의심거래",
];

const currencyFormatter = new Intl.NumberFormat("ko-KR");

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const body = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || body?.success === false || !body) {
    throw new Error(
      body?.error?.message ||
        "요청을 처리하지 못했습니다. 백엔드 서버 상태를 확인해 주세요.",
    );
  }

  return body.data;
}

function formatAmount(amount: number, currency: string) {
  return `${currencyFormatter.format(amount)} ${currency}`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildTransactionQuery(
  riskLevelFilter: RiskFilter,
  reviewStatusFilter: ReviewStatusFilter,
) {
  const params = new URLSearchParams();
  if (riskLevelFilter !== "all") {
    params.set("risk_level", riskLevelFilter);
  }
  if (reviewStatusFilter !== "전체") {
    params.set("review_status", reviewStatusFilter);
  }

  const query = params.toString();
  return query ? `/api/phase2/transactions?${query}` : "/api/phase2/transactions";
}

function isWithinDateRange(
  transactionTime: string,
  startDate: DateFilter,
  endDate: DateFilter,
) {
  const transactionDate = new Date(transactionTime);
  if (Number.isNaN(transactionDate.getTime())) {
    return true;
  }

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (transactionDate < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);
    if (transactionDate > end) {
      return false;
    }
  }

  return true;
}

function filterTransactionsByDate(
  items: TransactionListItem[],
  startDate: DateFilter,
  endDate: DateFilter,
) {
  if (!startDate && !endDate) {
    return items;
  }

  return items.filter((transaction) =>
    isWithinDateRange(transaction.transaction_time, startDate, endDate),
  );
}

function isInvalidDateRange(startDate: DateFilter, endDate: DateFilter) {
  return Boolean(startDate && endDate && startDate > endDate);
}

function getStatusCount(items: TransactionListItem[], status: string) {
  return items.filter((transaction) => transaction.review_status === status)
    .length;
}

function getRiskCount(items: TransactionListItem[], riskLevel: RiskLevel) {
  return items.filter((transaction) => transaction.risk_level === riskLevel)
    .length;
}

export default function Phase2Page() {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [selectedTransactionDetail, setSelectedTransactionDetail] =
    useState<TransactionDetail | null>(null);
  const [report, setReport] = useState<Phase2Report | null>(null);
  const [analyzeSummary, setAnalyzeSummary] = useState<AnalyzeSummary | null>(
    null,
  );
  const [draftRiskLevelFilter, setDraftRiskLevelFilter] =
    useState<RiskFilter>("all");
  const [draftReviewStatusFilter, setDraftReviewStatusFilter] =
    useState<ReviewStatusFilter>("전체");
  const [draftStartDate, setDraftStartDate] = useState<DateFilter>("");
  const [draftEndDate, setDraftEndDate] = useState<DateFilter>("");
  const [appliedRiskLevelFilter, setAppliedRiskLevelFilter] =
    useState<RiskFilter>("all");
  const [appliedReviewStatusFilter, setAppliedReviewStatusFilter] =
    useState<ReviewStatusFilter>("전체");
  const [appliedStartDate, setAppliedStartDate] = useState<DateFilter>("");
  const [appliedEndDate, setAppliedEndDate] = useState<DateFilter>("");
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
  const [listErrorMessage, setListErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(
    null,
  );
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(
    null,
  );
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [filterMessage, setFilterMessage] = useState<string | null>(null);
  const [pendingNavMessage, setPendingNavMessage] = useState<string | null>(
    null,
  );

  const loadTransactions = useCallback(async (
    riskFilter: RiskFilter,
    statusFilter: ReviewStatusFilter,
    startDate: DateFilter,
    endDate: DateFilter,
  ) => {
    setIsListLoading(true);
    setListErrorMessage(null);

    try {
      const data = await requestJson<TransactionListItem[]>(
        buildTransactionQuery(riskFilter, statusFilter),
      );
      const filteredData = filterTransactionsByDate(data, startDate, endDate);
      setTransactions(filteredData);
      setSelectedTransactionId((currentId) => {
        if (
          currentId &&
          filteredData.some((transaction) => transaction.id === currentId)
        ) {
          return currentId;
        }
        return filteredData[0]?.id ?? null;
      });
    } catch (error) {
      setTransactions([]);
      setSelectedTransactionId(null);
      setListErrorMessage(
        error instanceof Error
          ? error.message
          : "거래 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const loadSelectedTransaction = useCallback(async (transactionId: string) => {
    setIsDetailLoading(true);
    setIsReportLoading(true);
    setDetailErrorMessage(null);
    setReportErrorMessage(null);
    setSelectedTransactionDetail(null);
    setReport(null);

    const [detailResult, reportResult] = await Promise.allSettled([
      requestJson<TransactionDetail>(`/api/phase2/transactions/${transactionId}`),
      requestJson<Phase2Report>(
        `/api/phase2/transactions/${transactionId}/report`,
      ),
    ]);

    if (detailResult.status === "fulfilled") {
      setSelectedTransactionDetail(detailResult.value);
    } else {
      setDetailErrorMessage(
        detailResult.reason instanceof Error
          ? detailResult.reason.message
          : "거래 상세 정보를 불러오지 못했습니다.",
      );
    }

    if (reportResult.status === "fulfilled") {
      setReport(reportResult.value);
    } else {
      setReportErrorMessage(
        reportResult.reason instanceof Error
          ? reportResult.reason.message
          : "리포트 초안을 불러오지 못했습니다.",
      );
    }

    setIsDetailLoading(false);
    setIsReportLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransactions("all", "전체", "", "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTransactions]);

  useEffect(() => {
    if (selectedTransactionId) {
      const timeoutId = window.setTimeout(() => {
        void loadSelectedTransaction(selectedTransactionId);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedTransactionDetail(null);
      setReport(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSelectedTransaction, selectedTransactionId]);

  async function handleAnalyze() {
    setIsAnalyzeLoading(true);
    setPageMessage(null);

    try {
      const data = await requestJson<AnalyzeSummary>(
        "/api/phase2/transactions/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data_source: "sample",
            requested_by: "analyst-01",
          }),
        },
      );
      setAnalyzeSummary(data);
      setPageMessage("거래 분석이 완료되었습니다.");
      await loadTransactions(
        appliedRiskLevelFilter,
        appliedReviewStatusFilter,
        appliedStartDate,
        appliedEndDate,
      );
    } catch {
      setPageMessage(
        "거래 분석을 실행하지 못했습니다. 백엔드 서버 상태를 확인해 주세요.",
      );
    } finally {
      setIsAnalyzeLoading(false);
    }
  }

  async function handleStatusChanged() {
    if (selectedTransactionId) {
      await Promise.all([
        loadTransactions(
          appliedRiskLevelFilter,
          appliedReviewStatusFilter,
          appliedStartDate,
          appliedEndDate,
        ),
        loadSelectedTransaction(selectedTransactionId),
      ]);
    } else {
      await loadTransactions(
        appliedRiskLevelFilter,
        appliedReviewStatusFilter,
        appliedStartDate,
        appliedEndDate,
      );
    }
  }

  async function handleSearch() {
    if (isInvalidDateRange(draftStartDate, draftEndDate)) {
      setFilterMessage("시작 거래일은 종료 거래일보다 늦을 수 없습니다.");
      return;
    }

    setFilterMessage(null);
    setAppliedRiskLevelFilter(draftRiskLevelFilter);
    setAppliedReviewStatusFilter(draftReviewStatusFilter);
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
    await loadTransactions(
      draftRiskLevelFilter,
      draftReviewStatusFilter,
      draftStartDate,
      draftEndDate,
    );
  }

  async function handleResetFilters() {
    setDraftRiskLevelFilter("all");
    setDraftReviewStatusFilter("전체");
    setDraftStartDate("");
    setDraftEndDate("");
    setAppliedRiskLevelFilter("all");
    setAppliedReviewStatusFilter("전체");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setFilterMessage(null);
    await loadTransactions("all", "전체", "", "");
  }

  const selectedDetection = selectedTransactionDetail?.detection ?? null;

  const dashboardSummary = useMemo(() => {
    const totalCount = transactions.length;
    const suspiciousCount = getStatusCount(transactions, "의심거래");
    const unreviewedCount = getStatusCount(transactions, "미확인");
    const inReviewCount = getStatusCount(transactions, "검토중");
    const normalCount = getStatusCount(transactions, "정상거래");
    const highCount = getRiskCount(transactions, "high");
    const mediumCount = getRiskCount(transactions, "medium");
    const lowCount = getRiskCount(transactions, "low");

    return {
      totalCount,
      suspiciousCount,
      unreviewedCount,
      inReviewCount,
      normalCount,
      risk: {
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      statuses: [
        { label: "미확인", value: unreviewedCount },
        { label: "검토중", value: inReviewCount },
        { label: "정상거래", value: normalCount },
        { label: "의심거래", value: suspiciousCount },
      ],
      risks: [
        { label: "상", value: highCount, tone: "bg-red-500" },
        { label: "중", value: mediumCount, tone: "bg-amber-500" },
        { label: "하", value: lowCount, tone: "bg-emerald-500" },
      ],
    };
  }, [transactions]);

  const analyzeSummaryContent = useMemo(() => {
    if (!analyzeSummary) {
      return (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          아직 실행한 분석 결과가 없습니다.
        </p>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">전체 거래</p>
          <p className="mt-1 text-lg font-semibold">
            {analyzeSummary.total_count}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">탐지 거래</p>
          <p className="mt-1 text-lg font-semibold">
            {analyzeSummary.detected_count}
          </p>
        </div>
        {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
          <div
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3"
            key={level}
          >
            <RiskBadge riskLevel={level} />
            <span className="text-lg font-semibold">
              {analyzeSummary.risk_summary[level] ?? 0}
            </span>
          </div>
        ))}
      </div>
    );
  }, [analyzeSummary]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <p className="shrink-0 text-base font-semibold text-slate-950">
            Financial AI Agent
          </p>
          <PhaseNav
            onPendingPhaseClick={() =>
              setPendingNavMessage("해당 Phase는 아직 준비 중입니다.")
            }
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {pendingNavMessage ? (
          <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {pendingNavMessage}
          </p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            FDS 의심거래 탐지
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            샘플 거래 데이터를 기반으로 의심 패턴을 탐지하고 담당자 검토
            리포트 초안을 확인하는 화면입니다.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                분석 실행
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                샘플 거래 데이터에 룰 기반 탐지를 적용하고 목록과 요약
                현황을 다시 계산합니다.
              </p>
            </div>
            <button
              className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isAnalyzeLoading}
              type="button"
              onClick={() => {
                void handleAnalyze();
              }}
            >
              {isAnalyzeLoading ? "분석 실행 중" : "거래 분석 실행"}
            </button>
          </div>

          {pageMessage ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {pageMessage}
            </p>
          ) : null}

          <div className="mt-5">{analyzeSummaryContent}</div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              거래 현황 요약
            </h2>
            <p className="text-sm text-slate-500">
              현재 조회 조건에 해당하는 거래 목록 기준으로 집계합니다.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="전체 거래" value={dashboardSummary.totalCount} />
            <SummaryCard
              label="의심거래"
              value={dashboardSummary.suspiciousCount}
            />
            <SummaryCard
              label="미확인"
              value={dashboardSummary.unreviewedCount}
            />
            <SummaryCard
              label="검토중"
              value={dashboardSummary.inReviewCount}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <SummaryBarGroup
              title="검토 상태별 현황"
              totalCount={dashboardSummary.totalCount}
              items={dashboardSummary.statuses.map((item) => ({
                ...item,
                tone: item.label === "의심거래" ? "bg-red-500" : "bg-slate-500",
              }))}
            />
            <SummaryBarGroup
              title="위험도별 현황"
              totalCount={dashboardSummary.totalCount}
              items={dashboardSummary.risks}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              조회 조건
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              조건을 선택한 뒤 조회를 눌러야 목록에 반영됩니다.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end">
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-800 sm:max-w-56">
              위험도 필터
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={draftRiskLevelFilter}
                onChange={(event) =>
                  setDraftRiskLevelFilter(event.target.value as RiskFilter)
                }
              >
                {riskFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-800 sm:max-w-56">
              검토상태 필터
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={draftReviewStatusFilter}
                onChange={(event) =>
                  setDraftReviewStatusFilter(
                    event.target.value as ReviewStatusFilter,
                  )
                }
              >
                {reviewStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-800 sm:max-w-56">
              시작 거래일
              <input
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                type="date"
                value={draftStartDate}
                onChange={(event) => setDraftStartDate(event.target.value)}
              />
            </label>
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-800 sm:max-w-56">
              종료 거래일
              <input
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                type="date"
                value={draftEndDate}
                onChange={(event) => setDraftEndDate(event.target.value)}
              />
            </label>
            <div className="flex gap-2">
              <button
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isListLoading}
                type="button"
                onClick={() => {
                  void handleSearch();
                }}
              >
                조회
              </button>
              <button
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isListLoading}
                type="button"
                onClick={() => {
                  void handleResetFilters();
                }}
              >
                초기화
              </button>
            </div>
          </div>
          {filterMessage ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {filterMessage}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            적용 조건: 위험도{" "}
            {riskFilterOptions.find(
              (option) => option.value === appliedRiskLevelFilter,
            )?.label ?? "전체"}{" "}
            / 검토상태 {appliedReviewStatusFilter} / 거래일{" "}
            {appliedStartDate || "전체"} ~ {appliedEndDate || "전체"}
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">거래 목록</h3>
            <p className="text-sm text-slate-500">
              {isListLoading ? "조회 중" : `${transactions.length}건 표시`}
            </p>
          </div>
          {!selectedTransactionId && !isListLoading && transactions.length > 0 ? (
            <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              거래 행을 선택하면 상세 정보와 mock 리포트 초안을 확인할 수 있습니다.
            </p>
          ) : null}
          <TransactionTable
            transactions={transactions}
            selectedTransactionId={selectedTransactionId}
            isLoading={isListLoading}
            errorMessage={listErrorMessage}
            onSelectTransaction={setSelectedTransactionId}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight">
                거래 상세 정보
              </h3>
              {selectedTransactionDetail ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {selectedTransactionDetail.transaction.transaction_id}
                </span>
              ) : null}
            </div>
            {isDetailLoading ? (
              <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                거래 상세 정보를 불러오는 중입니다.
              </p>
            ) : detailErrorMessage ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {detailErrorMessage}
              </p>
            ) : selectedTransactionDetail ? (
              <div className="mt-5 space-y-5">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">거래 ID</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.transaction_id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">고객 ID</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.customer_id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">계좌 ID</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.account_id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">거래 유형</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.transaction_type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">금액</dt>
                    <dd className="mt-1 font-medium">
                      {formatAmount(
                        selectedTransactionDetail.transaction.amount,
                        selectedTransactionDetail.transaction.currency,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">채널</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.channel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">거래 시각</dt>
                    <dd className="mt-1 font-medium">
                      {formatDateTime(
                        selectedTransactionDetail.transaction.transaction_time,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">위치</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.location}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">기기 ID</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.device_id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">IP 주소</dt>
                    <dd className="mt-1 font-medium">
                      {selectedTransactionDetail.transaction.ip_address}
                    </dd>
                  </div>
                </dl>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <RiskBadge
                      riskLevel={selectedTransactionDetail.detection.risk_level}
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      risk_score {selectedTransactionDetail.detection.risk_score}
                    </span>
                    <span className="text-sm text-slate-600">
                      {selectedTransactionDetail.detection.review_status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {selectedTransactionDetail.detection.reason_summary}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    reviewed_by:{" "}
                    {selectedTransactionDetail.detection.reviewed_by ?? "-"} /
                    reviewed_at:{" "}
                    {formatDateTime(
                      selectedTransactionDetail.detection.reviewed_at,
                    )}
                  </p>
                </div>

                <ReviewStatusButton
                  key={selectedTransactionId ?? "no-transaction"}
                  transactionId={selectedTransactionId}
                  currentStatus={selectedDetection?.review_status ?? null}
                  onStatusChanged={handleStatusChanged}
                />

                <ReportCard
                  report={report}
                  isLoading={isReportLoading}
                  errorMessage={reportErrorMessage}
                />
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                거래를 선택하면 상세 정보가 표시됩니다.
              </p>
            )}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SummaryBarGroup({
  title,
  totalCount,
  items,
}: {
  title: string;
  totalCount: number;
  items: Array<{ label: string; value: number; tone: string }>;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const width = totalCount > 0 ? (item.value / totalCount) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">{item.label}</span>
                <span>{item.value}건</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.tone}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
