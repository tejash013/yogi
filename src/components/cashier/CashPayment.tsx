import { Input } from '@/components/ui';
import { formatINR, useCashierStore } from '@/store';

export default function CashPayment() {
  const calculateTotals = useCashierStore((s) => s.calculateTotals);
  const cashReceived = useCashierStore((s) => s.cashReceived);
  const setCashReceived = useCashierStore((s) => s.setCashReceived);
  const totals = calculateTotals();

  const received = parseFloat(cashReceived);
  const change = Number.isNaN(received) ? 0 : Math.max(0, received - totals.grandTotal);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Amount</span>
        <span className="text-lg font-bold text-neutral-900 dark:text-white">
          {formatINR(totals.grandTotal)}
        </span>
      </div>
      <Input
        type="number"
        min={0}
        value={cashReceived}
        onChange={(e) => setCashReceived(e.target.value)}
        placeholder="0"
        label="Cash Received"
      />
      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
        <span className="text-sm font-medium text-green-700 dark:text-green-300">Change to Return</span>
        <span className="text-xl font-bold text-green-600 dark:text-green-400">
          {formatINR(change)}
        </span>
      </div>
      {!Number.isNaN(received) && received < totals.grandTotal && (
        <p className="text-sm text-error">Cash received is less than the bill amount.</p>
      )}
    </div>
  );
}
