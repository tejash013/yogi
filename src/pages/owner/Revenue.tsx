import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const revenueStreams = [
  { label: 'Dine-in Revenue', value: '$28,450', ratio: 59 },
  { label: 'Takeaway Revenue', value: '$12,800', ratio: 26.5 },
  { label: 'Delivery Revenue', value: '$7,000', ratio: 14.5 },
];

export default function Revenue() {
  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Track revenue streams" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {revenueStreams.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">{item.value}</p>
              </div>
              <Badge variant="success" size="sm">
                {item.ratio}%
              </Badge>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${item.ratio}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Monthly Revenue Breakdown</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Compare revenue performance by month and channel.
              </p>
            </div>
            <Badge variant="primary" size="sm">
              Full view
            </Badge>
          </div>
          <div className="mt-6 flex h-64 items-center justify-center rounded-3xl bg-neutral-50 text-sm text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
            Revenue chart placeholder
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Highlights</h2>
          <ul className="mt-5 space-y-4">
            {[
              { label: 'Best Month', value: 'December', valueDetail: '$65,400' },
              { label: 'Best Channel', value: 'Dine-in', valueDetail: '59%' },
              { label: 'Growth Rate', value: '12.5%', valueDetail: 'vs last year' },
            ].map((item) => (
              <li key={item.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">{item.label}</p>
                    <p className="mt-1 font-semibold text-neutral-900 dark:text-white">{item.value}</p>
                  </div>
                  <span className="text-sm text-neutral-500">{item.valueDetail}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
