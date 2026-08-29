import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/constants';

type DashboardBadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const stats: Array<{ label: string; value: string; badge: string; variant: DashboardBadgeVariant }> = [
  { label: 'Total Orders', value: '156', badge: '+12%', variant: 'primary' },
  { label: 'Revenue', value: '₹4,892', badge: '+8%', variant: 'success' },
  { label: 'Customers', value: '89', badge: '+5%', variant: 'info' },
  { label: 'Active Tables', value: '12/20', badge: '60%', variant: 'secondary' },
];

const recentOrders = [
  { order: 'ORD-001', table: 5, status: 'Preparing', total: 38.85 },
  { order: 'ORD-002', table: 3, status: 'Completed', total: 41.41 },
  { order: 'ORD-003', table: 8, status: 'Pending', total: 25.89 },
  { order: 'ORD-004', table: 1, status: 'Ready', total: 52.25 },
];

const statusOptions = ['All', 'Pending', 'Preparing', 'Ready', 'Completed'] as const;

export default function AdminDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<typeof statusOptions[number]>('All');

  const filteredOrders = useMemo(
    () =>
      selectedStatus === 'All'
        ? recentOrders
        : recentOrders.filter((order) => order.status === selectedStatus),
    [selectedStatus]
  );

  const totalSales = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.total, 0),
    [filteredOrders]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Manager overview" description="A focused view of today's restaurant operations." />

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden rounded-[30px] border-[#efe4d7] bg-[#fffdfb] shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(226,181,110,0.25),_transparent_35%),linear-gradient(135deg,#201a17_0%,#171412_100%)] p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#f0d7aa]">Friday, 22 August</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Service is moving well.</h2>
                <p className="mt-2 max-w-xl text-sm text-neutral-300">Keep an eye on the rush, clear the kitchen queue, and make the next decision with confidence.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={ROUTES.ADMIN.ORDERS} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">Open orders</Link>
                <Link to={ROUTES.ADMIN.REPORTS} className="rounded-xl bg-[#f0d7aa] px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-[#e6c78a]">View reports</Link>
              </div>
            </div>
          </div>

          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-[#f0e4d7] bg-[#f9f5f1] p-5 dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{item.label}</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{item.value}</p>
                  <Badge variant={item.variant} size="sm">{item.badge}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-[#efe4d7] bg-[#fffdfb] shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <CardHeader className="mb-4 p-6 pb-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a57a3f] dark:text-[#f0d7aa]">Quick actions</p>
              <h3 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Operations</h3>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Menu coverage', value: '94%', href: ROUTES.ADMIN.MENU_MANAGEMENT },
                { label: 'Pending orders', value: '4', href: ROUTES.ADMIN.ORDERS },
              ].map((item) => (
                <Link key={item.label} to={item.href} className="rounded-[24px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 transition hover:border-[#e0c18e] hover:bg-[#f5ecdf] dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800">
                  <p className="text-sm text-neutral-500">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-white">{item.value}</p>
                  <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-[#9c6931]">Open view</span>
                </Link>
              ))}
            </div>
            <div className="rounded-[24px] border border-dashed border-[#eadcc7] bg-[#f9f5f1] p-5 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Today's activity</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 shadow-sm dark:bg-neutral-900">
                  <span>Orders placed</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">42</span>
                </li>
                <li className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 shadow-sm dark:bg-neutral-900">
                  <span>Tables served</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">18</span>
                </li>
                <li className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 shadow-sm dark:bg-neutral-900">
                  <span>New reservations</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">6</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[30px] border-[#efe4d7] bg-[#fffdfb] shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
        <CardHeader className="p-6 pb-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Recent orders</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Live order updates and tracking overview.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? 'rounded-full bg-[#171412] text-white hover:bg-[#2a241f]' : 'rounded-full border-[#d9c2a4] bg-white text-[#241d18] hover:bg-[#f7eddc] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white'}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Filtered order total</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">₹{totalSales.toFixed(2)}</p>
            </div>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="rounded-[22px] border border-dashed border-[#eadcc7] bg-[#f9f5f1] p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">No orders match the selected filter.</p>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.order} className="flex flex-col gap-3 rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 dark:border-neutral-700 dark:bg-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{order.order}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Table {order.table}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'primary'} size="sm">{order.status}</Badge>
                  <span className="font-semibold text-neutral-900 dark:text-white">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

