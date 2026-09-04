import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCcw,
  FiShoppingBag,
  FiTrendingUp,
} from 'react-icons/fi';
import { PageHeader } from '@/components/common';
import { Button, Card, EmptyState } from '@/components/ui';
import { CashierStatsCard, PaymentStatusBadge } from '@/components/cashier';
import { formatINR, useCashierStore } from '@/store';
import { ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { ROUTES } from '@/constants';
import { getRelativeTime } from '@/utils';

export default function CashierDashboard() {
  const navigate = useNavigate();
  const orders = useCashierStore((s) => s.orders);
  const payments = useCashierStore((s) => s.payments);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );
    const todayPaid = payments.filter(
      (p) => p.status === 'paid' && new Date(p.date).toDateString() === today
    );
    const todaySales = todayPaid.reduce((s, p) => s + p.amount, 0);
    const paidBills = todayOrders.filter((o) => o.paymentStatus === 'paid').length;
    const pendingPayments = orders.filter(
      (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'pending' || o.paymentStatus === 'partially_paid'
    ).length;
    const refunded = payments
      .filter((p) => p.status === 'refunded' || p.status === 'partially_refunded')
      .reduce((s, p) => s + (p.refundAmount ?? 0), 0);
    const avgBill = todaySales > 0 && todayPaid.length > 0 ? todaySales / todayPaid.length : 0;
    return {
      todaySales,
      todayOrdersCount: todayOrders.length,
      paidBills,
      pendingPayments,
      refunded,
      avgBill,
    };
  }, [orders, payments]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [orders]
  );

  const pendingPaymentsList = orders.filter(
    (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'pending' || o.paymentStatus === 'partially_paid'
  );

  const openBill = (orderId: string) => {
    useCashierStore.getState().setSelectedOrder(orderId);
    navigate(ROUTES.CASHIER.BILLING);
  };

  return (
    <div>
      <PageHeader
        title="Cashier Dashboard"
        description="Overview of today's transactions"
        actions={
          <Button
            onClick={() => {
              useCashierStore.getState().createNewBill();
              navigate(ROUTES.CASHIER.BILLING);
            }}
          >
            + New Bill
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <CashierStatsCard
          label="Today's Sales"
          value={formatINR(stats.todaySales)}
          icon={<FiDollarSign className="h-5 w-5" />}
          accent="success"
        />
        <CashierStatsCard
          label="Today's Orders"
          value={stats.todayOrdersCount}
          icon={<FiShoppingBag className="h-5 w-5" />}
          accent="primary"
        />
        <CashierStatsCard
          label="Paid Bills"
          value={stats.paidBills}
          icon={<FiCheckCircle className="h-5 w-5" />}
          accent="info"
        />
        <CashierStatsCard
          label="Pending Payments"
          value={stats.pendingPayments}
          icon={<FiClock className="h-5 w-5" />}
          accent="warning"
        />
        <CashierStatsCard
          label="Refunded Amount"
          value={formatINR(stats.refunded)}
          icon={<FiRefreshCcw className="h-5 w-5" />}
          accent="error"
        />
        <CashierStatsCard
          label="Avg Bill Value"
          value={formatINR(stats.avgBill)}
          icon={<FiTrendingUp className="h-5 w-5" />}
          accent="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders will appear here once placed." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      {['Order', 'Table', 'Customer', 'Type', 'Amount', 'Payment', 'Status', 'Time', ''].map((h) => (
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
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="text-sm">
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{o.orderNumber}</td>
                        <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{o.tableNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{o.customer.name}</td>
                        <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{ORDER_TYPE_LABELS[o.orderType]}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{formatINR(o.total)}</td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </td>
                        <td className="px-4 py-3 capitalize text-neutral-700 dark:text-neutral-300">{o.status}</td>
                        <td className="px-4 py-3 text-neutral-500">{getRelativeTime(o.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => openBill(o.id)}>
                            View Bill
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Pending Payments</h3>
          {pendingPaymentsList.length === 0 ? (
            <EmptyState
              icon={<FiAlertCircle className="h-10 w-10" />}
              title="No pending payments"
              description="All payments are settled. Great job!"
            />
          ) : (
            <div className="space-y-3">
              {pendingPaymentsList.map((o) => (
                <Card key={o.id} padding="md">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{o.orderNumber}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {o.customer.name}
                        {o.tableNumber ? ` · Table ${o.tableNumber}` : ''} · {ORDER_TYPE_LABELS[o.orderType]}
                      </p>
                    </div>
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{formatINR(o.total)}</span>
                    <Button size="sm" onClick={() => openBill(o.id)}>
                      Open Bill
                    </Button>
                  </div>
                </Card>
              ))}
              <div className="rounded-xl bg-neutral-100 p-3 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                Accepted: {PAYMENT_METHOD_LABELS.cash} · {PAYMENT_METHOD_LABELS.upi}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
