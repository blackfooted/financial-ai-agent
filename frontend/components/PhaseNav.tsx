"use client";

import { usePathname, useRouter } from "next/navigation";

type PhaseNavProps = {
  onPendingPhaseClick: () => void;
};

const phases = [
  { title: "상품 비교 추천", href: "/" },
  { title: "이상거래 탐지", href: "/phase2" },
  { title: "민원 분류·자동응답" },
  { title: "기업분석 에이전트" },
];

export function PhaseNav({ onPendingPhaseClick }: PhaseNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav aria-label="금융 AI 에이전트 메뉴" className="w-full overflow-x-auto">
      <div className="flex min-w-max gap-4 lg:min-w-0 lg:flex-wrap">
        {phases.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : Boolean(item.href && pathname?.startsWith(item.href));

          return (
            <button
              key={item.title}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={`border-b-2 px-1 py-2 text-sm font-semibold ${
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => {
                if (!item.href) {
                  onPendingPhaseClick();
                  return;
                }

                if (!isActive) {
                  router.push(item.href);
                }
              }}
            >
              {item.title}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
