import { useEffect, useMemo, useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { employeesApi, inventoryApi, reportsApi } from '@/api';
import { formatCurrency } from '@/utils';
import { useTenantStore } from '@/store';

export default function Expenses() {
  const { branchId, currentBranch } = useTenantStore();
  const [report, setReport] = useState<any>({});
  const [inventory, setInventory] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);

        const [expRes, invRes, empRes] = await Promise.all([
          reportsApi.getExpenses({ startDate: start.toISOString(), endDate: now.toISOString() }).catch(() => ({ data: { data: {} } })),
          inventoryApi.getAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
          employeesApi.getAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        setReport(expRes?.data?.data ?? {});
        setInventory(Array.isArray(invRes?.data?.data) ? invRes.data.data : []);
        setEmployees(Array.isArray(empRes?.data?.data) ? empRes.data.data : []);
      } finally {
        setIsLoading(false);
      }
    };

    void loadExpenses();
  }, [branchId]);

  // Compute live expense items
  const inventoryCost = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  }, [inventory]);

  const payrollCost = useMemo(() => {
    return employees.filter((e) => e.isActive !== false).reduce((sum, emp) => sum + Number(emp.salary || 0), 0);
  }, [employees]);

  const taxCost = Number(report?.totalTaxes ?? 0);
  const totalCost = Number(report?.totalExpenses ?? (inventoryCost + payrollCost + taxCost));

  const categories = useMemo(() => {
    const sum = Math.max(1, totalCost);
    return [
      {
        label: 'Ingredients & Stock',
        value: formatCurrency(inventoryCost),
        amount: inventoryCost,
        percentage: Math.round((inventoryCost / sum) * 100),
        color: 'bg-amber-500',
      },
      {
        label: 'Staff Payroll',
        value: formatCurrency(payrollCost),
        amount: payrollCost,
        percentage: Math.round((payrollCost / sum) * 100),
        color: 'bg-indigo-500',
      },
      {
        label: 'Taxes & Compliance',
        value: formatCurrency(taxCost),
        amount: taxCost,
        percentage: Math.round((taxCost / sum) * 100),
        color: 'bg-rose-500',
      },
    ];
  }, [inventoryCost, payrollCost, taxCost, totalCost]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses & Cost Audit"
        description={`Monitor inventory procurement, payroll, and tax costs for ${currentBranch?.name || 'All Locations'}`}
        actions={<TenantSelector variant="pill" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : item.value}
                </p>
              </div>
              <Badge variant="warning" size="sm">
                {item.percentage}%
              </Badge>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max(4, item.percentage)}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Cost Distribution & Allocation</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Breakdown of active operating expenditures.
              </p>
            </div>
            <Badge variant="secondary" size="sm">Audit View</Badge>
          </div>

          <div className="mt-6 space-y-5">
            {categories.map((cat) => (
              <div key={cat.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cat.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{cat.percentage}% of total</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{cat.value}</span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className={`h-full rounded-full transition-all duration-500 ${cat.color}`} style={{ width: `${Math.max(4, cat.percentage)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Expense Summary</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: 'Total Operating Expenses', value: formatCurrency(totalCost) },
              { label: 'Stock Valuation (Active)', value: formatCurrency(inventoryCost) },
              { label: 'Active Employees on Payroll', value: `${employees.length} Staff` },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-neutral-500">{item.label}</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
