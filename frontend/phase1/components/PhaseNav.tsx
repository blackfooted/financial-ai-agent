type PhaseNavProps = {
  onPendingPhaseClick: () => void;
};

const phases = [
  {
    phase: "Phase 1",
    title: "금융 상품 비교 추천",
    active: true,
  },
  { phase: "Phase 2", title: "준비 중", active: false },
  { phase: "Phase 3", title: "준비 중", active: false },
  { phase: "Phase 4", title: "준비 중", active: false },
];

export function PhaseNav({ onPendingPhaseClick }: PhaseNavProps) {
  return (
    <nav aria-label="Phase 메뉴" className="w-full overflow-x-auto">
      <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
        {phases.map((item) => (
          <button
            key={item.phase}
            type="button"
            aria-current={item.active ? "page" : undefined}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              item.active
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            onClick={item.active ? undefined : onPendingPhaseClick}
          >
            <span className="font-semibold">{item.phase}</span>{" "}
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
