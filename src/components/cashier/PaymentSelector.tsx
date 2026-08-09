import type { CashierPaymentMethod } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { useCashierStore } from '@/store';
import { cn } from '@/utils';

const methods: CashierPaymentMethod[] = ['cash', 'upi', 'card', 'wallet', 'online'];

const icons: Record<CashierPaymentMethod, string> = {
  cash: '💰',
  upi: '📱',
  card: '💳',
  wallet: '👛',
  online: '🌐',
};

export default function PaymentSelector() {
  const paymentMethod = useCashierStore((s) => s.paymentMethod);
  const setPaymentMethod = useCashierStore((s) => s.setPaymentMethod);

  return (
    <div className="grid grid-cols-5 gap-2">
      {methods.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setPaymentMethod(m)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors',
            paymentMethod === m
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-200 hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-700'
          )}
        >
          <span className="text-xl">{icons[m]}</span>
          <span
            className={cn(
              'text-xs font-medium',
              paymentMethod === m ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-300'
            )}
          >
            {PAYMENT_METHOD_LABELS[m]}
          </span>
        </button>
      ))}
    </div>
  );
}
