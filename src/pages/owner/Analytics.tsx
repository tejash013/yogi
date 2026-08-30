import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const analyticsHighlights = [
  { label: 'Repeat Customers', value: '67%', badge: 'Up 4%' },
  { label: 'Online Orders', value: '58%', badge: 'Up 9%' },
  { label: 'Average Spend', value: '₹38.40', badge: 'Up 6%' },
];

const popularItems = [
  { name: 'Margherita Pizza', orders: 245, revenue: 3182.55 },
  { name: 'Grilled Salmon', orders: 189, revenue: 4723.11 },
  { name: 'Chocolate Lava Cake', orders: 167, revenue: 1501.33 },
  { name: 'BBQ Chicken Wings', orders: 145, revenue: 1738.55 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Detailed business analytics" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analyticsHighlights.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{item.value}</p>
              </div>
              <Badge variant="success" size="sm">
                {item.badge}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Order Performance</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Review how orders perform across time and channels.
              </p>
            </div>
            <Badge variant="primary" size="sm">
              Insights
            </Badge>
          </div>
          <div className="mt-6 flex h-72 items-center justify-center rounded-3xl bg-neutral-50 text-center text-sm text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
            Order performance chart placeholder
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Top Items</h2>
          <div className="mt-5 space-y-4">
            {popularItems.map((item) => (
              <div key={item.name} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.orders} orders</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">₹{item.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Customer Behavior</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Understand how customers engage with your restaurant.
            </p>
          </div>
          <Badge variant="secondary" size="sm">
            Data-rich view
          </Badge>
        </div>
        <div className="mt-6 flex h-48 items-center justify-center rounded-3xl bg-neutral-50 text-sm text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
          Customer behavior chart placeholder
        </div>
      </Card>
    </div>
  );
}

