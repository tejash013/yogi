import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" description="Detailed business analytics" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Order Trends</h3>
          <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <p className="text-sm text-neutral-400">Order trend chart placeholder</p>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Customer Growth</h3>
          <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <p className="text-sm text-neutral-400">Customer growth chart placeholder</p>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Popular Items</h3>
          <div className="space-y-3">
            {[
              { name: 'Margherita Pizza', orders: 245, revenue: 3182.55 },
              { name: 'Grilled Salmon', orders: 189, revenue: 4723.11 },
              { name: 'Chocolate Lava Cake', orders: 167, revenue: 1501.33 },
              { name: 'BBQ Chicken Wings', orders: 145, revenue: 1738.55 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.name}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{item.orders} orders</span>
                  <span className="ml-3 text-sm text-neutral-500">${item.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Peak Hours</h3>
          <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <p className="text-sm text-neutral-400">Peak hours chart placeholder</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

