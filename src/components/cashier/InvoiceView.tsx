import { Button, Modal } from '@/components/ui';
import type { Invoice } from '@/types/cashier';
import { ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
  onPrint: (inv: Invoice) => void;
}

export default function InvoiceView({ invoice, onClose, onPrint }: Props) {
  const restaurantInfo = useCashierStore((s) => s.restaurantInfo);
  if (!invoice) return null;

  const dateStr = new Date(invoice.issuedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Modal isOpen={!!invoice} onClose={onClose} title={`Invoice ${invoice.invoiceNumber}`} size="lg">
      <div id="invoice-print-area" className="space-y-5">
        {/* Restaurant header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-4 dark:border-neutral-700">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              {restaurantInfo.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{restaurantInfo.tagline}</p>
            <p className="mt-1 text-sm text-neutral-500">{restaurantInfo.address}</p>
            <p className="text-sm text-neutral-500">
              {restaurantInfo.phone} · {restaurantInfo.email}
            </p>
            <p className="text-sm text-neutral-500">GST: {restaurantInfo.gstNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-500">TAX INVOICE</p>
            <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Customer & order */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Billed To
            </p>
            <p className="mt-1 font-medium text-neutral-900 dark:text-white">{invoice.customer.name}</p>
            <p className="text-neutral-500">{invoice.customer.phone}</p>
            {invoice.customer.email && <p className="text-neutral-500">{invoice.customer.email}</p>}
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Order Details
            </p>
            <p className="mt-1 font-medium text-neutral-900 dark:text-white">
              Order: {invoice.orderNumber}
            </p>
            {invoice.tableNumber && (
              <p className="text-neutral-500">Table: {invoice.tableNumber} · {ORDER_TYPE_LABELS[invoice.orderType]}</p>
            )}
            {!invoice.tableNumber && (
              <p className="text-neutral-500">{ORDER_TYPE_LABELS[invoice.orderType]}</p>
            )}
            <p className="text-neutral-500">{dateStr}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left dark:border-neutral-700">
              <th className="py-2 font-semibold text-neutral-500">Item</th>
              <th className="py-2 text-right font-semibold text-neutral-500">Qty</th>
              <th className="py-2 text-right font-semibold text-neutral-500">Price</th>
              <th className="py-2 text-right font-semibold text-neutral-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-100 dark:border-neutral-700">
                <td className="py-2">
                  <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-neutral-500">{item.variant}</p>
                  )}
                </td>
                <td className="py-2 text-right text-neutral-700 dark:text-neutral-300">{item.quantity}</td>
                <td className="py-2 text-right text-neutral-700 dark:text-neutral-300">{formatINR(item.unitPrice)}</td>
                <td className="py-2 text-right font-medium text-neutral-900 dark:text-white">
                  {formatINR(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
            <Row label="Discount" value={`−${formatINR(invoice.discount)}`} />
            <Row label="Tax" value={formatINR(invoice.tax)} />
            {invoice.additionalCharges > 0 && (
              <Row label="Additional Charges" value={formatINR(invoice.additionalCharges)} />
            )}
            <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
              <Row label="Grand Total" value={formatINR(invoice.grandTotal)} strong />
            </div>
            <Row label="Paid Amount" value={formatINR(invoice.paidAmount)} />
            <Row label="Payment Method" value={PAYMENT_METHOD_LABELS[invoice.paymentMethod]} />
          </div>
        </div>

        <p className="border-t border-neutral-200 pt-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Thank you for dining with us! Please visit again.
        </p>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onPrint(invoice)}>Print</Button>
      </div>
    </Modal>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={
          strong
            ? 'text-base font-bold text-neutral-900 dark:text-white'
            : 'font-medium text-neutral-800 dark:text-neutral-200'
        }
      >
        {value}
      </span>
    </div>
  );
}
