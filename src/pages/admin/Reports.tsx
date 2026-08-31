import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { reportsApi } from '@/api';
import { useOrderSyncStore, useTenantStore } from '@/store';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function AdminReports() {
  const { branchId, currentBranch } = useTenantStore();
  const [sales, setSales] = useState<any>({});
  const [revenue, setRevenue] = useState<any>({});
  const [expenses, setExpenses] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const syncVersion = useOrderSyncStore((state) => state.version);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [salesRes, revenueRes, expensesRes] = await Promise.all([
          reportsApi.getSales({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }).catch(() => ({ data: { data: {} } })),
          reportsApi.getRevenue({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }).catch(() => ({ data: { data: {} } })),
          reportsApi.getExpenses({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }).catch(() => ({ data: { data: {} } })),
        ]);

        setSales(salesRes?.data?.data ?? {});
        setRevenue(revenueRes?.data?.data ?? {});
        setExpenses(expensesRes?.data?.data ?? {});
      } finally {
        setIsLoading(false);
      }
    };

    void loadReports();
  }, [refreshCount, syncVersion, branchId]);

  const summary = useMemo(
    () => [
      { label: 'Total sales', value: formatCurrency(Number(sales?.totalSales ?? 0)), accent: 'primary' },
      { label: 'Average order', value: formatCurrency(Number(sales?.averageOrderValue ?? 0)), accent: 'success' },
      { label: 'Revenue', value: formatCurrency(Number(revenue?.totalRevenue ?? 0)), accent: 'warning' },
      { label: 'Profit', value: formatCurrency(Number(revenue?.profit ?? 0)), accent: 'info' },
    ],
    [sales, revenue]
  );

  const topItems = Array.isArray(sales?.topSellingItems) ? sales.topSellingItems : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reports"
        description={`Sales, revenue, and profit analytics for ${currentBranch?.name || 'Main Dining Hall'}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TenantSelector variant="pill" />
            <Button onClick={() => {
              useOrderSyncStore.getState().notifyResourceChange({
                type: 'update',
                resource: 'report',
                at: new Date().toISOString(),
              });
              setRefreshCount((count) => count + 1);
            }} className="rounded-full bg-[#171412] text-white hover:bg-[#2a241f] dark:bg-[#f3d7a2] dark:text-[#171412]">Generate Report</Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="rounded-[28px] border border-dashed border-[#eadcc7] bg-[#f9f4ee] p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          Loading report data...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <Card key={item.label} className="rounded-[28px] border-[#efe4d7] bg-[#fffdfb] p-5 shadow-[0_18px_50px_rgba(83,67,45,0.05)] dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{item.label}</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{item.value}</p>
                  <Badge variant={item.accent as any} size="sm" className="rounded-full">Live</Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[30px] border-[#efe4d7] bg-[#fffdfb] p-6 shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
              <CardHeader>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a57a3f] dark:text-[#f0d7aa]">Top selling items</p>
                  <h3 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Best performers</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topItems.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">No sales data available for this period.</p>
                ) : (
                  topItems.map((item: any, index: number) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.quantity} sold</p>
                      </div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(Number(item.revenue ?? 0))}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-[#efe4d7] bg-[#fffdfb] p-6 shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
              <CardHeader>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a57a3f] dark:text-[#f0d7aa]">Expenses overview</p>
                  <h3 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Cost profile</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Inventory value</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{formatCurrency(Number(expenses?.inventoryValue ?? 0))}</p>
                </div>
                <div className="rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Taxes</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{formatCurrency(Number(expenses?.totalTaxes ?? 0))}</p>
                </div>
                <div className="rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Total expenses</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{formatCurrency(Number(expenses?.totalExpenses ?? 0))}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

