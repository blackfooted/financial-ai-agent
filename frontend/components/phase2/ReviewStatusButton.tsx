import { useState } from "react";

type ReviewStatusButtonProps = {
  transactionId: string | null;
  currentStatus: string | null;
  onStatusChanged: () => Promise<void>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const reviewStatusOptions = ["미확인", "검토중", "정상거래", "의심거래"];

async function patchReviewStatus(transactionId: string, reviewStatus: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/phase2/transactions/${transactionId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        review_status: reviewStatus,
        reviewed_by: "analyst-01",
      }),
    },
  );

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.error?.message ||
        "검토 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
}

export function ReviewStatusButton({
  transactionId,
  currentStatus,
  onStatusChanged,
}: ReviewStatusButtonProps) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleStatusChange(nextStatus: string) {
    if (
      !transactionId ||
      nextStatus === currentStatus ||
      !reviewStatusOptions.includes(nextStatus)
    ) {
      return;
    }

    setIsSaving(true);
    setPendingStatus(nextStatus);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await patchReviewStatus(transactionId, nextStatus);
      await onStatusChanged();
      setSuccessMessage(`검토 상태가 ${nextStatus}(으)로 변경되었습니다.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "검토 상태를 변경하지 못했습니다.",
      );
    } finally {
      setIsSaving(false);
      setPendingStatus(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            검토 상태 변경
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            현재 상태:{" "}
            <span className="font-semibold text-slate-800">
              {currentStatus ?? "거래 미선택"}
            </span>
          </p>
        </div>
        <label
          className="text-xs font-medium text-slate-600"
          htmlFor="phase2-review-status"
        >
          변경할 상태
        </label>
        <select
          id="phase2-review-status"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={!transactionId || isSaving}
          value={currentStatus ?? ""}
          onChange={(event) => {
            const nextStatus = event.target.value;
            void handleStatusChange(nextStatus);
          }}
        >
          {!currentStatus ? <option value="">거래를 선택하세요</option> : null}
          {reviewStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <p className="text-xs leading-5 text-slate-500">
          {isSaving
            ? `${pendingStatus ?? "선택한 상태"}(으)로 변경하는 중입니다.`
            : pendingStatus && pendingStatus !== currentStatus
              ? `${pendingStatus}(으)로 변경을 요청합니다.`
              : "담당자 식별자는 analyst-01로 전달됩니다."}
        </p>
        {successMessage ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
