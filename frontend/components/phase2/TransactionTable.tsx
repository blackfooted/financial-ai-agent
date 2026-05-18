import { RiskBadge, type RiskLevel } from "@/components/phase2/RiskBadge";

export type TransactionListItem = {
  id: string;
  transaction_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  channel: string;
  transaction_time: string;
  risk_level: RiskLevel;
  risk_score: number;
  review_status: string;
};

type TransactionTableProps = {
  transactions: TransactionListItem[];
  selectedTransactionId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  onSelectTransaction: (transactionId: string) => void;
};

const currencyFormatter = new Intl.NumberFormat("ko-KR");

function formatAmount(amount: number, currency: string) {
  return `${currencyFormatter.format(amount)} ${currency}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function TransactionTable({
  transactions,
  selectedTransactionId,
  isLoading,
  errorMessage,
  onSelectTransaction,
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
        거래 목록을 불러오는 중입니다.
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
        조건에 맞는 거래가 없습니다. 필터를 전체로 변경하거나 거래 분석을 다시 실행해 주세요.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">거래 ID</th>
              <th className="px-4 py-3">고객 ID</th>
              <th className="px-4 py-3 text-right">금액</th>
              <th className="px-4 py-3">채널</th>
              <th className="px-4 py-3">거래 시각</th>
              <th className="px-4 py-3">위험도</th>
              <th className="px-4 py-3 text-right">risk_score</th>
              <th className="px-4 py-3">검토 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const isSelected = transaction.id === selectedTransactionId;

              return (
                <tr
                  key={transaction.id}
                  className={`cursor-pointer transition-colors hover:bg-emerald-50 ${
                    isSelected
                      ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200"
                      : "bg-white"
                  }`}
                  onClick={() => onSelectTransaction(transaction.id)}
                >
                  <td className="max-w-48 break-all px-4 py-3 font-medium text-slate-900">
                    {transaction.transaction_id}
                  </td>
                  <td className="max-w-36 break-all px-4 py-3 text-slate-700">
                    {transaction.customer_id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-800">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {transaction.channel}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatDateTime(transaction.transaction_time)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <RiskBadge riskLevel={transaction.risk_level} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        transaction.risk_score >= 80
                          ? "text-red-700"
                          : transaction.risk_score >= 50
                            ? "text-amber-700"
                            : "text-slate-800"
                      }`}
                    >
                      {transaction.risk_score}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {transaction.review_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
