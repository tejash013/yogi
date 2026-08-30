import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { ordersApi, reportsApi } from '@/api';
import { formatCurrency } from '@/utils';

export default function Analytics() {
  const [salesReport, setSalesReport] = useState<any>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [salesRes, ordersRes] = await Promise.all([
          reportsApi.getSales({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
          ordersApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        setSalesReport(salesRes?.data?.data ?? {});
        setOrders(Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : []);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const totalOrders = orders.length;
  const onlineOrders = orders.filter((o) => o.orderType === 'delivery' || o.orderType === 'takeaway').length;
  const onlineRatio = totalOrders > 0 ? Math.round((onlineOrders / totalOrders) * 100) : 0;
  const averageSpend = Number(salesReport?.averageOrderValue ?? 0);

  // Compute customer repeat rate
  const repeatRate = useMemo(() => {
    if (orders.length === 0) return 0;
    const userMap = new Map<string, number>();
    orders.forEach((o) => {
      const uid = String(o.user?._id ?? o.user ?? o.userId ?? 'guest');
      if (uid !== 'guest') {
        userMap.set(uid, (userMap.get(uid) ?? 0) + 1);
      }
    });
    const repeatUsers = Array.from(userMap.values()).filter((count) => count > 1).length;
    return userMap.size > 0 ? Math.round((repeatUsers / userMap.size) * 100) : 0;
  }, [orders]);

  const topItems: Array<{ name: string; quantity: number; revenue: number }> = useMemo(() => {
    if (Array.isArray(salesReport?.topSellingItems) && salesReport.topSellingItems.length > 0) {
      return salesReport.topSellingItems;
    }
    // Fallback computed from orders
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((o) => {
      (o.items || []).forEach((item: any) => {
        const name = item.name ?? item.menuItem?.title ?? 'Item';
        const qty = Number(item.quantity || 1);
        const price = Number(item.unitPrice || item.price || 0);
        const cur = map.get(name) ?? { name, quantity: 0, revenue: 0 };
        cur.quantity += qty;
        cur.revenue += qty * price;
        map.set(name, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [salesReport, orders]);

  // Order status breakdown for visual graph
  const statusCounts = useMemo(() => {
    const counts = { completed: 0, preparing: 0, ready: 0, pending: 0, cancelled: 0 };
    orders.forEach((o) => {
      const s = String(o.status || 'pending').toLowerCase();
      if (s in counts) (counts as any)[s]++;
    });
    return counts;
  }, [orders]);

  // Channel breakdown
  const channelBreakdown = useMemo(() => {
    const dineIn = orders.filter((o) => (o.orderType || 'dine-in') === 'dine-in').length;
    const takeaway = orders.filter((o) => o.orderType === 'takeaway').length;
    const delivery = orders.filter((o) => o.orderType === 'delivery').length;
    const max = Math.max(1, totalOrders);
    return [
      { label: 'Dine-in', count: dineIn, pct: Math.round((dineIn / max) * 100), color: 'bg-emerald-500' },
      { label: 'Takeaway', count: takeaway, pct: Math.round((takeaway / max) * 100), color: 'bg-amber-500' },
      { label: 'Delivery', count: delivery, pct: Math.round((delivery / max) * 100), color: 'bg-blue-500' },
    ];
  }, [orders, totalOrders]);

  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Detailed business intelligence and operational performance" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Repeat Customers</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">
                {isLoading ? '...' : `${repeatRate}%`}
              </p>
            </div>
            <Badge variant="success" size="sm">Retention</Badge>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Online & Delivery</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">
                {isLoading ? '...' : `${onlineRatio}%`}
              </p>
            </div>
            <Badge variant="primary" size="sm">Digital Orders</Badge>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Average Spend</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">
                {isLoading ? '...' : formatCurrency(averageSpend)}
              </p>
            </div>
            <Badge variant="info" size="sm">Per Order</Badge>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Order Pipeline & Performance</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Live volume distribution across order processing lifecycle.
              </p>
            </div>
            <Badge variant="primary" size="sm">Live Feed</Badge>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Completed Orders', count: statusCounts.completed, color: 'bg-emerald-500' },
              { label: 'Ready for Service', count: statusCounts.ready, color: 'bg-teal-500' },
              { label: 'Preparing in Kitchen', count: statusCounts.preparing, color: 'bg-amber-500' },
              { label: 'Pending Confirmation', count: statusCounts.pending, color: 'bg-indigo-500' },
              { label: 'Cancelled / Voided', count: statusCounts.cancelled, color: 'bg-rose-500' },
            ].map((entry) => {
              const widthPct = Math.round((entry.count / maxStatusCount) * 100);
              return (
                <div key={entry.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{entry.label}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{entry.count} orders</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className={`h-full rounded-full transition-all duration-500 ${entry.color}`} style={{ width: `${Math.max(4, widthPct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Top Performing Dishes</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Ranked by revenue contribution</p>
          <div className="mt-5 space-y-3">
            {topItems.length === 0 ? (
              <EmptyState title="No sales data yet" description="Dishes will rank here once orders are fulfilled." />
            ) : (
              topItems.map((item, idx) => (
                <div key={item.name} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.quantity} sold</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Customer Fulfillment Channels</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Breakdown of customer orders across Dine-in, Takeaway, and Delivery.
            </p>
          </div>
          <Badge variant="secondary" size="sm">Channel Analytics</Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {channelBreakdown.map((ch) => (
            <div key={ch.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm font-medium text-neutral-500">{ch.label}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{ch.pct}%</p>
                <span className="text-xs font-semibold text-neutral-400">{ch.count} orders</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
