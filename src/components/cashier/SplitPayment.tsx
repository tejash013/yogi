import { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import type { CashierPaymentMethod } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

const methods: CashierPaymentMethod[] = ['cash', 'upi'];

export default function SplitPayment() {
  const splitPayments = useCashierStore((s) => s.splitPayments);
  const addPayment = useCashierStore((s) => s.addPayment);
  const removePayment = useCashierStore((s) => s.removePayment);
  const calculateTotals = useCashierStore((s) => s.calculateTotals);
  const totals = calculateTotals();

  const [method, setMethod] = useState<CashierPaymentMethod>('cash');
  const [amount, setAmount] = useState('');

  const paid = splitPayments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, totals.grandTotal - paid);
  const parsedAmount = parseFloat(amount);

  const handleAdd = () => {
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    addPayment({ method, amount: parsedAmount });
    setAmount('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">Bill Amount</span>
        <span className="font-semibold text-neutral-900 dark:text-white">{formatINR(totals.grandTotal)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select
          options={methods.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))}
          value={method}
          onChange={(e) => setMethod(e.target.value as CashierPaymentMethod)}
        />
        <Input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Remaining ${formatINR(remaining)}`}
        />
      </div>
      <Button fullWidth variant="outline" onClick={handleAdd}>
        Add Payment
      </Button>

      {splitPayments.length > 0 && (
        <div className="space-y-2">
          {splitPayments.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
            >
              <span className="font-medium text-neutral-700 dark:text-neutral-200">
                {PAYMENT_METHOD_LABELS[p.method]}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-white">{formatINR(p.amount)}</span>
                <button
                  type="button"
                  onClick={() => removePayment(i)}
                  className="text-neutral-400 hover:text-red-600"
                  aria-label="Remove payment"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Paid</span>
          <span className="font-semibold text-neutral-900 dark:text-white">{formatINR(paid)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Remaining</span>
          <span
            className={
              remaining === 0
                ? 'font-semibold text-green-600 dark:text-green-400'
                : 'font-semibold text-warning'
            }
          >
            {formatINR(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
