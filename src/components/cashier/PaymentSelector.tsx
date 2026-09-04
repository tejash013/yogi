import type { CashierPaymentMethod } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { useCashierStore } from '@/store';
import { cn } from '@/utils';

const methods: CashierPaymentMethod[] = ['cash', 'upi'];

const icons: Record<CashierPaymentMethod, string> = {
  cash: '💵',
  upi: '📱',
};

const sublabels: Record<CashierPaymentMethod, string> = {
  cash: 'Physical Currency',
  upi: 'Google Pay / PhonePe / QR',
};

export default function PaymentSelector() {
  const paymentMethod = useCashierStore((s) => s.paymentMethod);
  const setPaymentMethod = useCashierStore((s) => s.setPaymentMethod);

  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setPaymentMethod(m)}
          className={cn(
            'flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all',
            paymentMethod === m
              ? 'border-primary-500 bg-primary-50/80 shadow-xs dark:border-primary-500 dark:bg-primary-950/30'
              : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-750 dark:bg-neutral-850 dark:hover:border-neutral-700'
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-xs dark:bg-neutral-800">
            {icons[m]}
          </span>
          <div>
            <span
              className={cn(
                'block text-sm font-bold',
                paymentMethod === m ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-800 dark:text-neutral-200'
              )}
            >
              {PAYMENT_METHOD_LABELS[m]}
            </span>
            <span className="block text-[11px] text-neutral-400">
              {sublabels[m]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
