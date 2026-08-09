import { formatINR, useCashierStore } from '@/store';

export default function TaxSummary() {
  const taxes = useCashierStore((s) => s.taxes);
  const calculateTotals = useCashierStore((s) => s.calculateTotals);
  const totals = calculateTotals();
  const taxable = Math.max(0, totals.subtotal - totals.discountAmount);

  return (
    <div className="space-y-1.5">
      {taxes.map((tax) => {
        const amount = (taxable * tax.percentage) / 100;
        return (
          <div key={tax.id} className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              {tax.name} ({tax.percentage}%)
            </span>
            <span className="font-medium text-neutral-900 dark:text-white">
              {formatINR(amount)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-1.5 text-sm dark:border-neutral-700">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">Total Tax</span>
        <span className="font-semibold text-neutral-900 dark:text-white">
          {formatINR(totals.taxAmount)}
        </span>
      </div>
    </div>
  );
}
