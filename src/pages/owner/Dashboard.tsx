import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const dashboardStats = [
  { label: 'Total Revenue', value: '$48,250', badge: '+12.5%', badgeVariant: 'success' as const },
  { label: 'Total Orders', value: '1,245', badge: '+8.3%', badgeVariant: 'info' as const },
  { label: 'Active Customers', value: '892', badge: '+15.2%', badgeVariant: 'primary' as const },
  { label: 'Net Profit', value: '$12,580', badge: '+10.1%', badgeVariant: 'secondary' as const },
];

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Owner Dashboard" description="High-level overview of your business" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{stat.label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">{stat.value}</p>
              </div>
              <Badge variant={stat.badgeVariant} size="sm">
                {stat.badge}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Snapshot</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Track weekly and monthly performance at a glance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Today</Button>
              <Button variant="outline" size="sm">This Month</Button>
              <Button variant="outline" size="sm">This Year</Button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Weekly Revenue', value: '$12,450' },
              { label: 'Monthly Revenue', value: '$48,250' },
              { label: 'Quarterly Revenue', value: '$142,800' },
              { label: 'Yearly Revenue', value: '$528,000' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="mt-3 text-xl font-semibold text-neutral-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Business Insights</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Quick operational metrics for better decisions.
              </p>
            </div>
            <Badge variant="info" size="sm">
              Stable
            </Badge>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Profit Margin', value: '26.1%' },
              { label: 'Table Turnover', value: '3.8/day' },
              { label: 'Average Order Value', value: '$39.10' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-neutral-500">{metric.label}</p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">{metric.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Owner Actions</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Manage your business operations from a single view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {['Review Reports', 'Approve Budget', 'Publish Update', 'Invite Manager'].map((action) => (
              <Button key={action} variant="outline" size="sm">
                {action}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

