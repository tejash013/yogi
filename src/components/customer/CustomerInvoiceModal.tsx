import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';
import { formatDateTime } from '@/utils';
import type { Order } from '@/types';
import { FiX, FiDownload } from 'react-icons/fi';

interface CustomerInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerInvoiceModal({
  order,
  isOpen,
  onClose,
}: CustomerInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const subtotal = order.subtotal || order.items.reduce((s, i) => s + (i.unitPrice || 0) * (i.quantity || 1), 0);
  const tax = order.tax || Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = order.deliveryType === 'delivery' ? 40 : 0;
  const discount = order.discount || 0;
  const total = order.total || (subtotal + tax + deliveryFee - discount);
  const cgst = (tax / 2).toFixed(2);
  const sgst = (tax / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {/* Top Action Bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/90 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 text-white font-bold text-sm">
              📄
            </span>
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Tax Invoice
              </h3>
              <p className="text-xs text-neutral-500">#{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
            >
              <FiDownload className="h-4 w-4" /> Download Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200/80 text-neutral-700 transition hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="overflow-y-auto p-6 md:p-8" ref={invoiceRef}>
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 shadow-sm">
            {/* Header: Restaurant & Invoice Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white text-lg font-black shadow-md">
                    R
                  </span>
                  <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                    Restaurant<span className="text-primary-500">OS</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500 font-medium">
                  Authentic Dining Experience & Smart Kitchen
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  12, MG Road, Indiranagar, Bengaluru, Karnataka 560038
                </p>
                <p className="text-[11px] text-neutral-400">
                  GSTIN: <span className="font-semibold text-neutral-600 dark:text-neutral-300">29ABCDE1234F1Z5</span> | Phone: +91 80 4112 9090
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block rounded-lg bg-green-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-green-800 dark:bg-green-950/60 dark:text-green-300">
                  {order.paymentStatus === 'paid' ? 'TAX INVOICE · PAID' : 'TAX INVOICE'}
                </span>
                <p className="mt-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Invoice #: INV-{order.orderNumber}
                </p>
                <p className="text-xs text-neutral-500">
                  Order ID: <span className="font-semibold text-neutral-700 dark:text-neutral-300">#{order.orderNumber}</span>
                </p>
                <p className="text-xs text-neutral-500">
                  Date: {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Billed To / Dining Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-200 text-xs dark:border-neutral-800">
              <div>
                <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
                  Billed To
                </p>
                <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-0.5">
                  {order.userName || 'Valued Customer'}
                </p>
                <p className="text-neutral-500">
                  Order Mode: <span className="font-bold uppercase text-primary-600 dark:text-primary-400">{order.deliveryType || 'Dine In'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
                  Payment Details
                </p>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                  Method: <span className="capitalize text-neutral-900 dark:text-white">{order.paymentMethod || 'Online'}</span>
                </p>
                <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Status: {order.paymentStatus.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase">
                    <th className="pb-2">Dish Item</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="py-2.5">
                      <td className="py-2.5 font-bold text-neutral-900 dark:text-white">
                        {item.name}
                        {item.specialInstructions && (
                          <span className="block text-[10px] font-normal text-neutral-400 italic">
                            Note: {item.specialInstructions}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right text-neutral-600 dark:text-neutral-400">
                        ₹{(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-neutral-900 dark:text-white">
                        ₹{((item.unitPrice || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Tax Calculation */}
            <div className="border-t border-neutral-200 pt-4 text-xs dark:border-neutral-800">
              <div className="space-y-1.5 ml-auto max-w-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>CGST (2.5%)</span>
                  <span>₹{cgst}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>SGST (2.5%)</span>
                  <span>₹{sgst}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-base font-black text-neutral-900 dark:border-white dark:text-white">
                  <span>Total Amount Paid</span>
                  <span className="text-primary-500">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-8 rounded-xl bg-neutral-50 p-4 text-center text-xs text-neutral-500 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                Thank you for your order! 🍽️
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                For any queries regarding this bill, please contact support@restaurantos.com or call +91 80 4112 9090.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900 print:hidden">
          <span className="text-xs text-neutral-500">
            This is a computer-generated tax invoice.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="md" onClick={handlePrint}>
              <FiDownload className="mr-1.5 h-4 w-4" /> Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
