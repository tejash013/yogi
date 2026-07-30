import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const expenseCategories = [
  { label: 'Ingredients', value: '$18,500', percentage: 42 },
  { label: 'Staff Salaries', value: '$12,000', percentage: 27 },
  { label: 'Utilities', value: '$3,200', percentage: 7 },
  { label: 'Rent', value: '$5,000', percentage: 11 },
  { label: 'Marketing', value: '$2,800', percentage: 6 },
  { label: 'Other', value: '$3,000', percentage: 7 },
];

export default function Expenses() {
  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Monitor business expenses" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {expenseCategories.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">{item.value}</p>
              </div>
              <Badge variant="warning" size="sm">
                {item.percentage}%
              </Badge>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${item.percentage}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Expense Trends</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Monitor how expenses shift month over month.
              </p>
            </div>
            <Badge variant="secondary" size="sm">
              Expense view
            </Badge>
          </div>
          <div className="mt-6 flex h-64 items-center justify-center rounded-3xl bg-neutral-50 text-sm text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
            Expense trend chart placeholder
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Expense Summary</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: 'Total Expenses', value: '$44,500' },
              { label: 'Average Cost', value: '$3,708' },
              { label: 'Cost Ratio', value: '67%' },
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
