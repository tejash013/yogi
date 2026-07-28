import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Orders', value: '156', change: '+12%', color: 'text-primary-500' },
    { label: 'Revenue', value: '$4,892', change: '+8%', color: 'text-green-500' },
    { label: 'Customers', value: '89', change: '+5%', color: 'text-blue-500' },
    { label: 'Active Tables', value: '12/20', change: '60%', color: 'text-purple-500' },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Overview of your restaurant" />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
              <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Orders</h3>
          <button className="text-sm text-primary-500 hover:text-primary-600">View All</button>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">ORD-00{i}</p>
                <p className="text-sm text-neutral-500">Table {i + 2} • {['Pending', 'Preparing', 'Ready'][i % 3]}</p>
              </div>
              <span className="font-medium text-neutral-900 dark:text-white">${(10 + i * 5).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

