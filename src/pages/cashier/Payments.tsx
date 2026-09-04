import { useMemo, useState } from 'react';
import { Card, EmptyState, Input, Search, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { PaymentDetails, PaymentStatusBadge, RefundModal } from '@/components/cashier';
import { formatINR, useCashierStore } from '@/store';
import type { CashierPaymentMethod, Payment } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';

const methodOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
];

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'partially_refunded', label: 'Partially Refunded' },
  { value: 'unpaid', label: 'Unpaid' },
];

export default function Payments() {
  const payments = useCashierStore((s) => s.payments);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (q) {
        const haystack = [
          p.paymentNumber,
          p.orderNumber,
          p.invoiceNumber ?? '',
          p.customerName,
          p.transactionId,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (method !== 'all' && p.paymentMethod !== (method as CashierPaymentMethod)) return false;
      if (status !== 'all' && p.status !== status) return false;
      if (dateFrom && new Date(p.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(p.date) > new Date(dateTo + 'T23:59:59')) return false;
      if (minAmount && p.amount < parseFloat(minAmount)) return false;
      if (maxAmount && p.amount > parseFloat(maxAmount)) return false;
      return true;
    });
  }, [payments, search, method, status, dateFrom, dateTo, minAmount, maxAmount]);

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track and manage all payments"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search payments..."
            />
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Select
            options={methodOptions}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            label="Payment Method"
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Payment Status"
          />
          <Input
            type="date"
            label="From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            label="To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Input
            type="number"
            label="Min Amount"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            type="number"
            label="Max Amount"
            placeholder="∞"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </Card>

      {/* Payments table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No payments found" description="Try adjusting your filters." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  {[
                    'Payment ID',
                    'Order',
                    'Invoice',
                    'Customer',
                    'Amount',
                    'Method',
                    'Status',
                    'Transaction ID',
                    'Date',
                    'Cashier',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-900">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    className="cursor-pointer text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{p.paymentNumber}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.orderNumber}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.invoiceNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{formatINR(p.amount)}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                      {PAYMENT_METHOD_LABELS[p.paymentMethod]}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.transactionId}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(p.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.cashier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail modal */}
      <PaymentDetails
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRefund={(pay) => setRefundTarget(pay)}
      />

      {/* Refund modal */}
      <RefundModal
        payment={refundTarget}
        onClose={() => {
          setRefundTarget(null);
          setSelectedPayment(null);
        }}
      />
    </div>
  );
}
