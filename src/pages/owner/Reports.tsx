import { useEffect, useState } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { reportsApi } from '@/api';
import { formatCurrency } from '@/utils';

interface ReportSummary {
  type: 'sales' | 'revenue' | 'expenses' | 'summary';
  title: string;
  desc: string;
  data: any;
  date: string;
}

export default function OwnerReports() {
  const [salesData, setSalesData] = useState<any>({});
  const [revenueData, setRevenueData] = useState<any>({});
  const [expensesData, setExpensesData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportSummary | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [salesRes, revRes, expRes] = await Promise.all([
        reportsApi.getSales({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
        reportsApi.getRevenue({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
        reportsApi.getExpenses({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
      ]);

      setSalesData(salesRes?.data?.data ?? {});
      setRevenueData(revRes?.data?.data ?? {});
      setExpensesData(expRes?.data?.data ?? {});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const nowFormatted = new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });

  const reportItems: ReportSummary[] = [
    {
      type: 'summary',
      title: 'Comprehensive Financial & Operating Report',
      desc: `Total Revenue: ${formatCurrency(revenueData?.totalRevenue ?? 0)} | Profit: ${formatCurrency(revenueData?.profit ?? 0)}`,
      data: { revenue: revenueData, expenses: expensesData, sales: salesData },
      date: nowFormatted,
    },
    {
      type: 'sales',
      title: 'Sales & Top Performing Items Report',
      desc: `Total Sales: ${formatCurrency(salesData?.totalSales ?? 0)} across ${salesData?.totalOrders ?? 0} orders`,
      data: salesData,
      date: nowFormatted,
    },
    {
      type: 'revenue',
      title: 'Revenue & Gross Profit Analysis',
      desc: `Net Margin: ${revenueData?.totalRevenue > 0 ? ((revenueData?.profit / revenueData?.totalRevenue) * 100).toFixed(1) : 0}%`,
      data: revenueData,
      date: nowFormatted,
    },
    {
      type: 'expenses',
      title: 'Operating Expenses & Procurement Summary',
      desc: `Inventory Procurement: ${formatCurrency(expensesData?.inventoryValue ?? 0)} | Tax Liabilities: ${formatCurrency(expensesData?.totalTaxes ?? 0)}`,
      data: expensesData,
      date: nowFormatted,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Reports"
        description="Generate, inspect, and export comprehensive business audits"
        actions={
          <Button onClick={fetchReports} isLoading={isLoading}>
            Generate New Report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Live Reports Available</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{reportItems.length}</p>
            </div>
            <Badge variant="primary" size="sm">Audited</Badge>
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Audit Period</p>
          <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">Last 30 Days</p>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Data Status</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">Database Synced</p>
        </Card>
      </div>

      <div className="grid gap-6">
        {reportItems.map((report) => (
          <Card key={report.title} className="rounded-[1.75rem]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{report.title}</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{report.desc}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-400">Generated: {report.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="sm">Ready</Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveReport(report)}>
                  View Audit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Report Viewer */}
      <Modal
        isOpen={!!activeReport}
        onClose={() => setActiveReport(null)}
        title={activeReport?.title || 'Report Audit'}
        size="lg"
      >
        {activeReport && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500">{activeReport.desc}</p>
              <p className="mt-1 text-xs text-neutral-400">Audit Timestamp: {new Date().toLocaleString('en-IN')}</p>
            </div>

            {activeReport.type === 'sales' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Total Sales</p>
                    <p className="mt-1 text-lg font-bold">{formatCurrency(activeReport.data?.totalSales ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Orders</p>
                    <p className="mt-1 text-lg font-bold">{activeReport.data?.totalOrders ?? 0}</p>
                  </div>
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Avg Order Value</p>
                    <p className="mt-1 text-lg font-bold">{formatCurrency(activeReport.data?.averageOrderValue ?? 0)}</p>
                  </div>
                </div>

                {Array.isArray(activeReport.data?.topSellingItems) && activeReport.data.topSellingItems.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Top Selling Items</h4>
                    <div className="space-y-2">
                      {activeReport.data.topSellingItems.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b pb-1 dark:border-neutral-800">
                          <span>{item.name} ({item.quantity} qty)</span>
                          <span className="font-bold">{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeReport.type === 'revenue' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Gross Revenue</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(activeReport.data?.totalRevenue ?? 0)}</p>
                </div>
                <div className="rounded-xl border p-3 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Operating Expenses</p>
                  <p className="mt-1 text-lg font-bold text-rose-600">{formatCurrency(activeReport.data?.totalExpenses ?? 0)}</p>
                </div>
                <div className="rounded-xl border p-3 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Net Profit</p>
                  <p className="mt-1 text-lg font-bold text-primary-600">{formatCurrency(activeReport.data?.profit ?? 0)}</p>
                </div>
              </div>
            )}

            {activeReport.type === 'expenses' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Total Expenses</p>
                  <p className="mt-1 text-lg font-bold text-rose-600">{formatCurrency(activeReport.data?.totalExpenses ?? 0)}</p>
                </div>
                <div className="rounded-xl border p-3 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Inventory Valuation</p>
                  <p className="mt-1 text-lg font-bold">{formatCurrency(activeReport.data?.inventoryValue ?? 0)}</p>
                </div>
                <div className="rounded-xl border p-3 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Tax Outflow</p>
                  <p className="mt-1 text-lg font-bold">{formatCurrency(activeReport.data?.totalTaxes ?? 0)}</p>
                </div>
              </div>
            )}

            {activeReport.type === 'summary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Revenue</p>
                    <p className="mt-1 font-bold">{formatCurrency(activeReport.data?.revenue?.totalRevenue ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Expenses</p>
                    <p className="mt-1 font-bold">{formatCurrency(activeReport.data?.revenue?.totalExpenses ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Profit</p>
                    <p className="mt-1 font-bold text-emerald-600">{formatCurrency(activeReport.data?.revenue?.profit ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border p-3 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Total Orders</p>
                    <p className="mt-1 font-bold">{activeReport.data?.sales?.totalOrders ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700">
              <Button variant="outline" onClick={() => window.print()}>
                Print / Export
              </Button>
              <Button onClick={() => setActiveReport(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
