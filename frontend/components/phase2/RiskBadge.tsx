export type RiskLevel = "low" | "medium" | "high";

type RiskBadgeProps = {
  riskLevel: RiskLevel | string;
};

const riskBadgeMap: Record<
  RiskLevel,
  { label: string; className: string }
> = {
  low: {
    label: "하",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  medium: {
    label: "중",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  high: {
    label: "상",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  const badge = riskBadgeMap[riskLevel as RiskLevel] ?? {
    label: "확인 필요",
    className: "border-slate-200 bg-white text-slate-600",
  };

  return (
    <span
      className={`inline-flex min-w-10 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
