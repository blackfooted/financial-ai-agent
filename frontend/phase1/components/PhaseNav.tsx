type PhaseNavProps = {
  onPendingPhaseClick: () => void;
};

const phases = [
  { title: "상품 비교 추천", active: true },
  { title: "이상거래 탐지", active: false },
  { title: "민원 분류·자동응답", active: false },
  { title: "기업분석 에이전트", active: false },
];

export function PhaseNav({ onPendingPhaseClick }: PhaseNavProps) {
  return (
    <nav aria-label="금융 AI 에이전트 메뉴" className="w-full overflow-x-auto">
      <div className="flex min-w-max gap-4 lg:min-w-0 lg:flex-wrap">
        {phases.map((item) => (
          <button
            key={item.title}
            type="button"
            aria-current={item.active ? "page" : undefined}
            className={`border-b-2 px-1 py-2 text-sm font-semibold ${
              item.active
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            onClick={item.active ? undefined : onPendingPhaseClick}
          >
            {item.title}
          </button>
        ))}
      </div>
    </nav>
  );
}
