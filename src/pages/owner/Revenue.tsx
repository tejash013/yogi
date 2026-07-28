import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function Revenue() {
  return (
    <div>
      <PageHeader title="Revenue" description="Track revenue streams" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Dine-in Revenue', value: '$28,450', percentage: '59%' },
          { label: 'Takeaway Revenue', value: '$12,800', percentage: '26.5%' },
          { label: 'Delivery Revenue', value: '$7,000', percentage: '14.5%' },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-neutral-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{item.value}</p>
            <p className="text-sm text-green-500">{item.percentage} of total</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Monthly Revenue Breakdown</h3>
        <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-800">
          <p className="text-sm text-neutral-400">Revenue chart placeholder</p>
        </div>
      </Card>
    </div>
  );
}
