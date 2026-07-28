import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function CashierDashboard() {
  return (
    <div>
      <PageHeader title="Cashier Dashboard" description="Overview of today transactions" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Today Revenue', value: '$2,450', change: '+15%', color: 'text-green-500' },
          { label: 'Orders Today', value: '42', change: '+8%', color: 'text-blue-500' },
          { label: 'Pending Payments', value: '3', change: '-2', color: 'text-yellow-500' },
          { label: 'Avg Order Value', value: '$58.33', change: '+5%', color: 'text-primary-500' },
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
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Recent Transactions</h3>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {[
              { order: 'ORD-001', amount: 38.85, method: 'Cash', status: 'paid' },
              { order: 'ORD-002', amount: 41.41, method: 'Card', status: 'paid' },
              { order: 'ORD-003', amount: 25.89, method: 'UPI', status: 'pending' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{tx.order}</p>
                  <p className="text-sm text-neutral-500">{tx.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900 dark:text-white">${tx.amount.toFixed(2)}</p>
                  <p className={`text-sm ${tx.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Payment Methods</h3>
          <div className="space-y-3">
            {[
              { method: 'Cash', count: 18, total: 1042.50 },
              { method: 'Card', count: 15, total: 895.75 },
              { method: 'UPI', count: 7, total: 345.25 },
              { method: 'Online', count: 2, total: 166.50 },
            ].map((pm, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{pm.method}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{pm.count} transactions</span>
                  <span className="ml-3 text-sm text-neutral-500">${pm.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

