import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function KitchenDashboard() {
  return (
    <div>
      <PageHeader title="Kitchen Dashboard" description="Overview of kitchen operations" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending Orders', value: '5', color: 'text-yellow-500' },
          { label: 'Preparing', value: '3', color: 'text-blue-500' },
          { label: 'Ready to Serve', value: '2', color: 'text-green-500' },
          { label: 'Completed Today', value: '28', color: 'text-primary-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Current Orders</h3>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {[
            { order: 'ORD-001', table: 5, items: 'Margherita Pizza, Caesar Salad', time: '5 min', status: 'preparing' },
            { order: 'ORD-004', table: 3, items: 'Grilled Salmon, Chocolate Cake', time: '12 min', status: 'preparing' },
            { order: 'ORD-007', table: 8, items: 'BBQ Wings, Mango Smoothie', time: 'Just now', status: 'pending' },
          ].map((order, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-white">{order.order}</span>
                  <Badge variant={order.status === 'preparing' ? 'primary' : 'warning'} size="sm">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-500">Table {order.table} • {order.items}</p>
              </div>
              <span className="text-sm font-medium text-neutral-500">{order.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

