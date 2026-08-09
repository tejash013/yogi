import { Button, Card } from '@/components/ui';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

interface Props {
  onViewInvoice: () => void;
  onPrintReceipt: () => void;
  onNewBill: () => void;
}

export default function PaymentSuccess({ onViewInvoice, onPrintReceipt, onNewBill }: Props) {
  const paymentSuccess = useCashierStore((s) => s.paymentSuccess);

  if (!paymentSuccess) return null;

  const dateStr = new Date(paymentSuccess.date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-9 w-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
            Payment Successful
          </h2>
          <p className="mt-1 text-sm text-neutral-500">The bill has been paid successfully.</p>
        </div>

        <div className="mt-6 space-y-3 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <Row label="Order Number" value={paymentSuccess.orderNumber} />
          <Row label="Invoice Number" value={paymentSuccess.invoiceNumber} />
          <Row label="Paid Amount" value={formatINR(paymentSuccess.paidAmount)} strong />
          <Row label="Payment Method" value={PAYMENT_METHOD_LABELS[paymentSuccess.paymentMethod]} />
          <Row label="Date & Time" value={dateStr} />
        </div>

        <div className="mt-6 space-y-2">
          <Button fullWidth onClick={onViewInvoice}>
            View Invoice
          </Button>
          <Button fullWidth variant="outline" onClick={onPrintReceipt}>
            Print Receipt
          </Button>
          <Button fullWidth variant="ghost" onClick={onNewBill}>
            New Bill
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={
          strong
            ? 'font-bold text-primary-500'
            : 'font-medium text-neutral-900 dark:text-white'
        }
      >
        {value}
      </span>
    </div>
  );
}
