import { Button, Modal } from '@/components/ui';
import type { Payment } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';
import PaymentStatusBadge from './PaymentStatusBadge';

interface Props {
  payment: Payment | null;
  onClose: () => void;
  onRefund: (payment: Payment) => void;
}

export default function PaymentDetails({ payment, onClose, onRefund }: Props) {
  const invoices = useCashierStore((s) => s.invoices);
  if (!payment) return null;

  const invoice = invoices.find((i) => i.invoiceNumber === payment.invoiceNumber);

  const dateStr = new Date(payment.date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const canRefund = payment.amount > 0 && ['paid', 'partially_paid'].includes(payment.status);

  return (
    <Modal isOpen={!!payment} onClose={onClose} title="Payment Details" size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Payment ID</p>
            <p className="font-semibold text-neutral-900 dark:text-white">{payment.paymentNumber}</p>
          </div>
          <PaymentStatusBadge status={payment.status} size="md" />
        </div>

        <Section title="Payment Information">
          <Row label="Amount" value={formatINR(payment.amount)} strong />
          <Row label="Original Amount" value={formatINR(payment.originalAmount)} />
          <Row label="Payment Method" value={PAYMENT_METHOD_LABELS[payment.paymentMethod]} />
          <Row label="Transaction ID" value={payment.transactionId} />
          <Row label="Date & Time" value={dateStr} />
          <Row label="Cashier" value={payment.cashier} />
        </Section>

        <Section title="Order Information">
          <Row label="Order Number" value={payment.orderNumber} />
          <Row label="Invoice Number" value={payment.invoiceNumber ?? '—'} />
        </Section>

        <Section title="Customer Information">
          <Row label="Customer" value={payment.customerName} />
        </Section>

        {invoice && (
          <Section title="Payment Breakdown">
            {invoice.items.map((item) => (
              <Row
                key={item.id}
                label={`${item.name} × ${item.quantity}`}
                value={formatINR(item.totalPrice)}
              />
            ))}
            <div className="my-2 border-t border-neutral-200 dark:border-neutral-700" />
            <Row label="Grand Total" value={formatINR(invoice.grandTotal)} strong />
            <Row label="Paid" value={formatINR(payment.amount)} />
          </Section>
        )}

        {payment.status === 'refunded' && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            Refunded {formatINR(payment.refundAmount ?? 0)}. Reason: {payment.refundReason}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {canRefund && (
            <Button variant="danger" onClick={() => onRefund(payment)}>
              Refund
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
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
            ? 'font-bold text-neutral-900 dark:text-white'
            : 'font-medium text-neutral-800 dark:text-neutral-200'
        }
      >
        {value}
      </span>
    </div>
  );
}
