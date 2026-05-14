"use client";

import { ReactNode, useState } from "react";

import { PhaseNav } from "@/components/PhaseNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <p className="shrink-0 text-base font-semibold text-slate-950">
            Financial AI Agent
          </p>
          <PhaseNav
            onPendingPhaseClick={() =>
              setPendingMessage("해당 Phase는 아직 준비 중입니다.")
            }
          />
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            금융 상품 비교 추천
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            사용자 조건을 바탕으로 예금·적금·대출 상품을 탐색하고
            비교합니다.
          </p>
          <p className="max-w-3xl rounded-md bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            본 서비스는 금융상품 탐색을 돕는 참고용 도구입니다.
          </p>
          {pendingMessage ? (
            <p className="max-w-3xl rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {pendingMessage}
            </p>
          ) : null}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
