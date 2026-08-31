import { useEffect, useMemo, useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { ordersApi, reportsApi } from '@/api';
import { formatCurrency } from '@/utils';
import { useTenantStore } from '@/store';

export default function Revenue() {
  const { branchId, currentBranch } = useTenantStore();
  const [revenueData, setRevenueData] = useState<any>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRevenue = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1); // year-to-date

        const [revRes, ordersRes] = await Promise.all([
          reportsApi.getRevenue({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
          ordersApi.getAll({ page: 1, limit: 200 }).catch(() => ({ data: { data: [] } })),
        ]);

        setRevenueData(revRes?.data?.data ?? {});
        setOrders(Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : []);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRevenue();
  }, [branchId]);

  const totalRevenue = Number(revenueData?.totalRevenue ?? orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + Number(o.total || 0), 0));

  // Compute revenue by channel dynamically
  const streams = useMemo(() => {
    let dineInTotal = 0;
    let takeawayTotal = 0;
    let deliveryTotal = 0;

    orders.forEach((order) => {
      const amount = Number(order.total || 0);
      const type = String(order.orderType || 'dine-in');
      if (type === 'delivery') deliveryTotal += amount;
      else if (type === 'takeaway') takeawayTotal += amount;
      else dineInTotal += amount;
    });

    const sum = Math.max(1, dineInTotal + takeawayTotal + deliveryTotal);

    return [
      {
        label: 'Dine-in Revenue',
        value: formatCurrency(dineInTotal),
        amount: dineInTotal,
        ratio: Math.round((dineInTotal / sum) * 100),
        color: 'bg-emerald-500',
      },
      {
        label: 'Takeaway Revenue',
        value: formatCurrency(takeawayTotal),
        amount: takeawayTotal,
        ratio: Math.round((takeawayTotal / sum) * 100),
        color: 'bg-amber-500',
      },
      {
        label: 'Delivery Revenue',
        value: formatCurrency(deliveryTotal),
        amount: deliveryTotal,
        ratio: Math.round((deliveryTotal / sum) * 100),
        color: 'bg-primary-500',
      },
    ];
  }, [orders]);

  // Compute monthly revenue distribution from orders
  const monthlyBreakdown = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Array(12).fill(0);

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (!Number.isNaN(d.getTime())) {
        const m = d.getMonth();
        monthlyMap[m] += Number(o.total || 0);
      }
    });

    const maxMonth = Math.max(1, ...monthlyMap);

    return months.map((month, idx) => ({
      month,
      amount: monthlyMap[idx],
      heightPct: Math.max(8, Math.round((monthlyMap[idx] / maxMonth) * 100)),
    }));
  }, [orders]);

  const bestChannel = useMemo(() => {
    const sorted = [...streams].sort((a, b) => b.amount - a.amount);
    return sorted[0] || { label: 'Dine-in', ratio: 100 };
  }, [streams]);

  const highlights = useMemo(() => {
    return [
      { label: 'Current Period Revenue', value: formatCurrency(totalRevenue), detail: 'Gross Billings' },
      { label: 'Top Revenue Channel', value: bestChannel.label.replace(' Revenue', ''), detail: `${bestChannel.ratio}% of sales` },
      { label: 'Operating Status', value: 'Active', detail: `${orders.length} transactions audited` },
    ];
  }, [totalRevenue, bestChannel, orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Analysis"
        description={`Track revenue streams, billing volumes, and financial flow for ${currentBranch?.name || 'All Locations'}`}
        actions={<TenantSelector variant="pill" />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {streams.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : item.value}
                </p>
              </div>
              <Badge variant="success" size="sm">
                {item.ratio}%
              </Badge>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.ratio}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Monthly Revenue Trends</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Monthly revenue generated across all sales channels.
              </p>
            </div>
            <Badge variant="primary" size="sm">Annual View</Badge>
          </div>

          <div className="mt-8 flex h-64 items-end justify-between gap-2 px-2 pt-6">
            {monthlyBreakdown.map((item) => (
              <div key={item.month} className="group relative flex flex-1 flex-col items-center gap-2">
                <div className="invisible absolute -top-8 rounded bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white group-hover:visible dark:bg-neutral-100 dark:text-neutral-900">
                  {formatCurrency(item.amount)}
                </div>
                <div className="w-full max-w-[28px] overflow-hidden rounded-t-lg bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${item.heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Highlights</h2>
          <ul className="mt-5 space-y-4">
            {highlights.map((item) => (
              <li key={item.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">{item.label}</p>
                    <p className="mt-1 font-semibold text-neutral-900 dark:text-white">{item.value}</p>
                  </div>
                  <span className="text-xs font-semibold text-neutral-400">{item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
