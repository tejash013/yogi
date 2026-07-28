import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function OwnerDashboard() {
  return (
    <div>
      <PageHeader title="Owner Dashboard" description="High-level overview of your business" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: '$48,250', change: '+12.5%', color: 'text-green-500' },
          { label: 'Total Orders', value: '1,245', change: '+8.3%', color: 'text-blue-500' },
          { label: 'Active Customers', value: '892', change: '+15.2%', color: 'text-primary-500' },
          { label: 'Net Profit', value: '$12,580', change: '+10.1%', color: 'text-purple-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
              <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Revenue Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'This Week', value: '$12,450', change: '+8%' },
              { label: 'This Month', value: '$48,250', change: '+12%' },
              { label: 'This Quarter', value: '$142,800', change: '+15%' },
              { label: 'This Year', value: '$528,000', change: '+22%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</span>
                <div className="text-right">
                  <span className="font-medium text-neutral-900 dark:text-white">{item.value}</span>
                  <span className="ml-2 text-sm text-green-500">{item.change}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {['View Reports', 'Manage Staff', 'Update Menu', 'Check Analytics'].map((action) => (
              <button
                key={action}
                className="rounded-lg border border-neutral-200 p-4 text-center text-sm font-medium text-neutral-700 transition-colors hover:border-primary-500 hover:text-primary-500 dark:border-neutral-600 dark:text-neutral-300"
              >
                {action}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

