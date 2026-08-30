import type { Invoice } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

interface Props {
  invoice: Invoice;
}

/**
 * Receipt-friendly layout for browser printing.
 * Uses a fixed narrow width and monospace numbers.
 */
export default function ReceiptView({ invoice }: Props) {
  const restaurantInfo = useCashierStore((s) => s.restaurantInfo);
  const dateStr = new Date(invoice.issuedAt).toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="mx-auto w-[300px] bg-white p-4 font-mono text-xs text-neutral-900">
      <div className="text-center">
        <p className="text-base font-bold">{restaurantInfo.name}</p>
        <p>{restaurantInfo.address}</p>
        <p>{restaurantInfo.phone}</p>
        <p>GST: {restaurantInfo.gstNumber}</p>
      </div>

      <div className="my-3 border-t border-dashed border-neutral-400" />

      <div className="space-y-0.5">
        <p>Invoice: {invoice.invoiceNumber}</p>
        <p>Order: {invoice.orderNumber}</p>
        {invoice.tableNumber && <p>Table: {invoice.tableNumber}</p>}
        <p>Date: {dateStr}</p>
        <p>Customer: {invoice.customer.name}</p>
      </div>

      <div className="my-3 border-t border-dashed border-neutral-400" />

      {invoice.items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p>{item.name}</p>
            <p className="text-neutral-500">
              {item.quantity} × {formatINR(item.unitPrice)}
            </p>
          </div>
          <p className="font-bold">{formatINR(item.totalPrice)}</p>
        </div>
      ))}

      <div className="my-3 border-t border-dashed border-neutral-400" />

      <div className="space-y-0.5">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatINR(invoice.subtotal)}</span>
        </p>
        <p className="flex justify-between">
          <span>Discount</span>
          <span>−{formatINR(invoice.discount)}</span>
        </p>
        <p className="flex justify-between">
          <span>Tax</span>
          <span>{formatINR(invoice.tax)}</span>
        </p>
        {invoice.additionalCharges > 0 && (
          <p className="flex justify-between">
            <span>Charges</span>
            <span>{formatINR(invoice.additionalCharges)}</span>
          </p>
        )}
        <p className="flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span>{formatINR(invoice.grandTotal)}</span>
        </p>
        <p className="flex justify-between">
          <span>Paid</span>
          <span>{formatINR(invoice.paidAmount)}</span>
        </p>
        <p className="flex justify-between">
          <span>Method</span>
          <span>{PAYMENT_METHOD_LABELS[invoice.paymentMethod]}</span>
        </p>
      </div>

      <div className="my-3 border-t border-dashed border-neutral-400" />

      <p className="text-center">Thank you for your visit!</p>
      <p className="text-center text-neutral-500">Powered by {restaurantInfo.name}</p>
    </div>
  );
}
