import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { ordersApi, reportsApi, usersApi } from '@/api';
import { ROUTES } from '@/constants';
import { formatCurrency } from '@/utils';
import { useTenantStore } from '@/store';

type PeriodFilter = 'today' | 'month' | 'year';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { branchId, currentBranch, currentRestaurant } = useTenantStore();
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [salesData, setSalesData] = useState<any>({});
  const [revenueData, setRevenueData] = useState<any>({});
  const [expensesData, setExpensesData] = useState<any>({});
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        let start = new Date();

        if (period === 'today') {
          start.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          start = new Date(now.getFullYear(), 0, 1);
        }

        const [salesRes, revRes, expRes, ordersRes, usersRes] = await Promise.all([
          reportsApi.getSales({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
          reportsApi.getRevenue({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
          reportsApi.getExpenses({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
          ordersApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
          usersApi.getAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        setSalesData(salesRes?.data?.data ?? {});
        setRevenueData(revRes?.data?.data ?? {});
        setExpensesData(expRes?.data?.data ?? {});

        const rawOrders = Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : [];
        setOrderList(rawOrders);

        const rawUsers = Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [];
        const customers = rawUsers.filter((u: any) => u.role === 'customer' || !u.role);
        setCustomerCount(customers.length || rawUsers.length);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [period, branchId]);

  const totalRevenue = Number(revenueData?.totalRevenue ?? salesData?.totalSales ?? 0);
  const totalOrders = Number(salesData?.totalOrders ?? orderList.length ?? 0);
  const totalExpenses = Number(expensesData?.totalExpenses ?? revenueData?.totalExpenses ?? 0);
  const netProfit = Number(revenueData?.profit ?? (totalRevenue - totalExpenses));
  const averageOrderValue = Number(salesData?.averageOrderValue ?? (totalOrders ? totalRevenue / totalOrders : 0));
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const dashboardStats = useMemo(() => [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), badge: period === 'today' ? 'Today' : period === 'month' ? 'This Month' : 'This Year', badgeVariant: 'success' as const },
    { label: 'Total Orders', value: String(totalOrders), badge: `${orderList.filter((o) => o.status === 'completed').length} completed`, badgeVariant: 'info' as const },
    { label: 'Active Customers', value: String(customerCount), badge: 'Registered', badgeVariant: 'primary' as const },
    { label: 'Net Profit', value: formatCurrency(netProfit), badge: `${profitMargin}% margin`, badgeVariant: netProfit >= 0 ? ('success' as const) : ('error' as const) },
  ], [totalRevenue, totalOrders, orderList, customerCount, netProfit, profitMargin, period]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Dashboard"
        description={`Executive performance analytics for ${currentRestaurant?.name || 'Restaurant'} · ${currentBranch?.name || 'All Locations'}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TenantSelector variant="pill" />
            <Button
              variant={period === 'today' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('today')}
            >
              Today
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              This Month
            </Button>
            <Button
              variant={period === 'year' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              This Year
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{stat.label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
              <Badge variant={stat.badgeVariant} size="sm">
                {stat.badge}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Snapshot</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Track financial metrics and performance across operational channels.
              </p>
            </div>
            <Link to={ROUTES.OWNER.REVENUE}>
              <Button variant="outline" size="sm">Full Revenue Breakdown →</Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Gross Revenue', value: formatCurrency(totalRevenue) },
              { label: 'Operating Expenses', value: formatCurrency(totalExpenses) },
              { label: 'Average Order Value', value: formatCurrency(averageOrderValue) },
              { label: 'Net Profit', value: formatCurrency(netProfit) },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="mt-3 text-xl font-semibold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : item.value}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Business Insights</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Live operational health metrics.
              </p>
            </div>
            <Badge variant="info" size="sm">
              Live
            </Badge>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Profit Margin', value: `${profitMargin}%` },
              { label: 'Total Orders Placed', value: String(totalOrders) },
              { label: 'Average Spend / Order', value: formatCurrency(averageOrderValue) },
            ].map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-neutral-500">{metric.label}</p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {isLoading ? '...' : metric.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Quick Navigation</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Direct access to owner analytics, expenses, reports, and administrative management.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.ANALYTICS)}>
              Item Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.REVENUE)}>
              Revenue Streams
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.EXPENSES)}>
              Expenses Audit
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.REPORTS)}>
              Generate Reports
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
