type PhaseSidebarProps = {
  onPendingPhaseClick: () => void;
};

const phases = [
  {
    phase: "Phase 1",
    title: "금융 상품 비교 추천",
    status: "활성",
    active: true,
  },
  { phase: "Phase 2", title: "준비 중", status: "준비 중", active: false },
  { phase: "Phase 3", title: "준비 중", status: "준비 중", active: false },
  { phase: "Phase 4", title: "준비 중", status: "준비 중", active: false },
];

export function PhaseSidebar({ onPendingPhaseClick }: PhaseSidebarProps) {
  return (
    <nav
      aria-label="Phase 메뉴"
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        {phases.map((item) => (
          <button
            key={item.phase}
            type="button"
            aria-current={item.active ? "page" : undefined}
            className={`w-full rounded-md border px-4 py-3 text-left ${
              item.active
                ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            onClick={item.active ? undefined : onPendingPhaseClick}
          >
            <span className="block text-xs font-semibold uppercase">
              {item.phase}
            </span>
            <span className="mt-1 block text-sm font-semibold">
              {item.title}
            </span>
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${
                item.active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.status}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
