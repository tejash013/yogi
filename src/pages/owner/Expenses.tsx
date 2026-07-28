import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function Expenses() {
  return (
    <div>
      <PageHeader title="Expenses" description="Monitor business expenses" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Ingredients', value: '$18,500', percentage: '42%' },
          { label: 'Staff Salaries', value: '$12,000', percentage: '27%' },
          { label: 'Utilities', value: '$3,200', percentage: '7%' },
          { label: 'Rent', value: '$5,000', percentage: '11%' },
          { label: 'Marketing', value: '$2,800', percentage: '6%' },
          { label: 'Other', value: '$3,000', percentage: '7%' },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-neutral-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{item.value}</p>
            <p className="text-sm text-yellow-500">{item.percentage} of total</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Expense Trends</h3>
        <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-800">
          <p className="text-sm text-neutral-400">Expense chart placeholder</p>
        </div>
      </Card>
    </div>
  );
}
