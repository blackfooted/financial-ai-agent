"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
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
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskFilter>("all");
  const [reviewStatusFilter, setReviewStatusFilter] =
    useState<ReviewStatusFilter>("전체");
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

  const loadTransactions = useCallback(async () => {
    setIsListLoading(true);
    setListErrorMessage(null);

    try {
      const data = await requestJson<TransactionListItem[]>(
        buildTransactionQuery(riskLevelFilter, reviewStatusFilter),
      );
      setTransactions(data);
      setSelectedTransactionId((currentId) => {
        if (currentId && data.some((transaction) => transaction.id === currentId)) {
          return currentId;
        }
        return data[0]?.id ?? null;
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
  }, [riskLevelFilter, reviewStatusFilter]);

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
      void loadTransactions();
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
      await loadTransactions();
    } catch (error) {
      setPageMessage(
        error instanceof Error
          ? error.message
          : "거래 분석 실행 중 오류가 발생했습니다.",
      );
    } finally {
      setIsAnalyzeLoading(false);
    }
  }

  async function handleStatusChanged() {
    if (selectedTransactionId) {
      await Promise.all([
        loadTransactions(),
        loadSelectedTransaction(selectedTransactionId),
      ]);
    } else {
      await loadTransactions();
    }
  }

  const selectedDetection = selectedTransactionDetail?.detection ?? null;

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
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Phase 2. FDS 의심거래 탐지
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                샘플 거래 데이터를 기반으로 의심 패턴을 탐지하고 담당자
                검토 리포트 초안을 확인하는 화면
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
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              위험도 필터
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={riskLevelFilter}
                onChange={(event) =>
                  setRiskLevelFilter(event.target.value as RiskFilter)
                }
              >
                {riskFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              검토상태 필터
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={reviewStatusFilter}
                onChange={(event) =>
                  setReviewStatusFilter(
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
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">거래 목록</h3>
            <p className="text-sm text-slate-500">
              {transactions.length}건 표시
            </p>
          </div>
          {!selectedTransactionId && !isListLoading ? (
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
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
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                거래를 선택하면 상세 정보가 표시됩니다.
              </p>
            )}
          </section>

          <div className="space-y-6">
            <ReviewStatusButton
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
        </div>
      </div>
    </AppShell>
  );
}
