import type { ReactNode } from "react";

import { RiskBadge, type RiskLevel } from "@/components/phase2/RiskBadge";

export type Phase2Report = {
  transaction_id: string;
  provider: string;
  report_title: string;
  risk_level: RiskLevel;
  risk_label?: string;
  summary: string;
  detected_rules: string[];
  review_points: string[];
  risk_factors?: Array<{
    rule: string;
    title: string;
    description: string;
    check_points: string[];
  }>;
  recommended_actions?: string[];
  customer_context_questions?: string[];
  evidence_summary?: Record<string, string | number | null>;
  limitations?: string[];
  disclaimer: string;
};

type ReportCardProps = {
  report: Phase2Report | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function ReportCard({
  report,
  isLoading,
  errorMessage,
}: ReportCardProps) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        의심거래 검토 리포트 초안을 불러오는 중입니다.
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {errorMessage}
      </section>
    );
  }

  if (!report) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        거래를 선택하면 담당자 검토용 mock 리포트 초안이 표시됩니다.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            의심거래 검토 리포트
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            탐지 룰과 거래 정보를 기반으로 생성한 담당자 검토용
            초안입니다. 최종 판단은 담당자가 수행합니다.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            거래 ID {report.transaction_id} / 초안 제목 {report.report_title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge riskLevel={report.risk_level} />
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            provider: {report.provider}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">요약</h4>
          <p className="mt-2 rounded-md bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {report.summary}
          </p>
        </div>

        <ReportSection title="탐지 근거 요약">
          {report.evidence_summary ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {Object.entries(report.evidence_summary).map(([key, value]) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                  key={key}
                >
                  <dt className="text-xs font-medium text-slate-500">
                    {evidenceLabelMap[key] ?? key}
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {value ?? "-"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <EmptyText>표시할 탐지 근거 요약이 없습니다.</EmptyText>
          )}
        </ReportSection>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">탐지 룰</h4>
          {report.detected_rules.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {report.detected_rules.map((rule) => (
                <span
                  key={rule}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {rule}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">탐지된 룰이 없습니다.</p>
          )}
        </div>

        <ReportSection title="위험 요인">
          {report.risk_factors && report.risk_factors.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {report.risk_factors.map((factor) => (
                <article
                  className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  key={factor.rule}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="text-sm font-semibold text-slate-900">
                      {factor.title}
                    </h5>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {factor.rule}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {factor.description}
                  </p>
                  <List items={factor.check_points} />
                </article>
              ))}
            </div>
          ) : (
            <EmptyText>표시할 위험 요인이 없습니다.</EmptyText>
          )}
        </ReportSection>

        <div className="grid gap-5 lg:grid-cols-2">
          <ReportSection title="검토 포인트">
            <List items={report.review_points} />
          </ReportSection>

          <ReportSection title="권장 확인 액션">
            <List items={report.recommended_actions ?? []} />
          </ReportSection>

          <ReportSection title="고객·거래 맥락 확인 질문">
            <List items={report.customer_context_questions ?? []} />
          </ReportSection>

          <ReportSection title="리포트 한계">
            <List items={report.limitations ?? []} />
          </ReportSection>
        </div>

        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
          최종 판단은 담당자가 수행합니다. {report.disclaimer}
        </p>
      </div>
    </section>
  );
}

const evidenceLabelMap: Record<string, string> = {
  amount: "금액",
  channel: "채널",
  transaction_time: "거래 시각",
  location: "위치",
  device_id: "기기 ID",
  risk_score: "risk_score",
  review_status: "검토 상태",
};

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <EmptyText>표시할 항목이 없습니다.</EmptyText>;
  }

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
