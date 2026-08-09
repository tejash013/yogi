import { formatINR, useCashierStore } from '@/store';

export default function BillSummary() {
  const calculateTotals = useCashierStore((s) => s.calculateTotals);
  const discount = useCashierStore((s) => s.discount);
  const removeDiscount = useCashierStore((s) => s.removeDiscount);
  const additionalCharges = useCashierStore((s) => s.additionalCharges);
  const setAdditionalCharges = useCashierStore((s) => s.setAdditionalCharges);
  const totals = calculateTotals();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
        <span className="font-medium text-neutral-900 dark:text-white">{formatINR(totals.subtotal)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
        <span className="font-medium text-green-600 dark:text-green-400">
          −{formatINR(totals.discountAmount)}
        </span>
      </div>
      {discount && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 px-2 py-1 text-xs dark:bg-green-900/20">
          <span className="text-green-700 dark:text-green-300">
            {discount.name}
            {discount.couponCode ? ` (${discount.couponCode})` : ''}
          </span>
          <button
            type="button"
            onClick={removeDiscount}
            className="text-green-700 underline hover:text-green-900"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">Tax</span>
        <span className="font-medium text-neutral-900 dark:text-white">{formatINR(totals.taxAmount)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">Additional Charges</span>
        <input
          type="number"
          value={additionalCharges || ''}
          onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-24 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-right text-sm text-neutral-900 focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
        <span className="text-base font-semibold text-neutral-900 dark:text-white">Grand Total</span>
        <span className="text-2xl font-bold text-primary-500">{formatINR(totals.grandTotal)}</span>
      </div>
    </div>
  );
}
