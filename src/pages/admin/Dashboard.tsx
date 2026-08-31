import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { menuApi, ordersApi, tablesApi, usersApi } from '@/api';
import { ROUTES } from '@/constants';
import { useOrderSyncStore, useTenantStore } from '@/store';
import { formatCurrency } from '@/utils';

type DashboardBadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const statusOptions = ['All', 'pending', 'preparing', 'ready', 'completed'] as const;

export default function AdminDashboard() {
  const { branchId, currentBranch, currentRestaurant } = useTenantStore();
  const [selectedStatus, setSelectedStatus] = useState<typeof statusOptions[number]>('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [menuCount, setMenuCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const syncVersion = useOrderSyncStore((state) => state.version);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, tablesRes, usersRes, menuRes] = await Promise.all([
          ordersApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
          tablesApi.getAll().catch(() => ({ data: { data: [] } })),
          usersApi.getAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
          menuApi.getAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        const rawOrders = Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : [];
        const rawTables = Array.isArray(tablesRes?.data?.data) ? tablesRes.data.data : Array.isArray(tablesRes?.data) ? tablesRes.data : [];
        const rawUsers = Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [];
        const rawMenu = Array.isArray(menuRes?.data?.data) ? menuRes.data.data : Array.isArray(menuRes?.data) ? menuRes.data : [];

        setOrders(rawOrders);
        setTables(rawTables);
        setCustomerCount(rawUsers.filter((u: any) => u.role === 'customer' || !u.role).length || rawUsers.length);
        setMenuCount(rawMenu.length);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, [syncVersion, branchId]);

  // Operational metrics
  const totalRevenue = useMemo(() => {
    return orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [orders]);

  const activeTablesCount = useMemo(() => {
    return tables.filter((t) => t.status === 'occupied' || t.status === 'reserved').length;
  }, [tables]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  }, [orders]);

  const stats: Array<{ label: string; value: string; badge: string; variant: DashboardBadgeVariant }> = useMemo(() => [
    { label: 'Total Orders', value: String(orders.length), badge: `${orders.filter((o) => o.status === 'completed').length} done`, variant: 'primary' },
    { label: 'Today Revenue', value: formatCurrency(totalRevenue), badge: 'Paid', variant: 'success' },
    { label: 'Registered Customers', value: String(customerCount), badge: 'Active', variant: 'info' },
    { label: 'Active Tables', value: `${activeTablesCount}/${Math.max(1, tables.length)}`, badge: `${tables.length > 0 ? Math.round((activeTablesCount / tables.length) * 100) : 0}%`, variant: 'secondary' },
  ], [orders, totalRevenue, customerCount, activeTablesCount, tables]);

  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'All') return orders;
    return orders.filter((order) => String(order.status).toLowerCase() === selectedStatus.toLowerCase());
  }, [orders, selectedStatus]);

  const totalFilteredSales = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [filteredOrders]);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Overview"
        description={`Real-time operations for ${currentRestaurant?.name || 'Restaurant'} · ${currentBranch?.name || 'Main Branch'}`}
        actions={<TenantSelector variant="pill" />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden rounded-[30px] border-[#efe4d7] bg-[#fffdfb] shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(226,181,110,0.25),_transparent_35%),linear-gradient(135deg,#201a17_0%,#171412_100%)] p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#f0d7aa]">{todayFormatted}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Service is active and moving.</h2>
                <p className="mt-2 max-w-xl text-sm text-neutral-300">Keep an eye on active tables, fulfill kitchen orders, and manage inventory seamlessly.</p>
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
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">
                    {isLoading ? '...' : item.value}
                  </p>
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
              <Link to={ROUTES.ADMIN.MENU_MANAGEMENT} className="rounded-[24px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 transition hover:border-[#e0c18e] hover:bg-[#f5ecdf] dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500">Menu Items</p>
                <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-white">{menuCount}</p>
                <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-[#9c6931]">Manage Menu</span>
              </Link>
              <Link to={ROUTES.ADMIN.ORDERS} className="rounded-[24px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 transition hover:border-[#e0c18e] hover:bg-[#f5ecdf] dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500">Pending Orders</p>
                <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-white">{pendingOrdersCount}</p>
                <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-[#9c6931]">View Queue</span>
              </Link>
            </div>
            <div className="rounded-[24px] border border-dashed border-[#eadcc7] bg-[#f9f5f1] p-5 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Live Activity Summary</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 shadow-sm dark:bg-neutral-900">
                  <span>Total orders placed</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{orders.length}</span>
                </li>
                <li className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 shadow-sm dark:bg-neutral-900">
                  <span>Active floor tables</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{activeTablesCount}</span>
                </li>
                <li className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 shadow-sm dark:bg-neutral-900">
                  <span>Registered accounts</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{customerCount}</span>
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
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Filtered volume ({filteredOrders.length} orders)</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{formatCurrency(totalFilteredSales)}</p>
            </div>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="rounded-[22px] border border-dashed border-[#eadcc7] bg-[#f9f5f1] p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">No orders match the selected filter.</p>
          ) : (
            filteredOrders.slice(0, 8).map((order) => {
              const orderNum = order.orderNumber || `ORD-${String(order._id || order.id).slice(-6).toUpperCase()}`;
              const tableNum = typeof order.table === 'object'
                ? order.table?.label || '—'
                : order.table || order.tableNumber || '—';
              const statusStr = String(order.status || 'pending');
              const amount = Number(order.total || 0);
              return (
                <div key={order._id || order.id} className="flex flex-col gap-3 rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-4 dark:border-neutral-700 dark:bg-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{orderNum}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Table {tableNum} • {order.orderType || 'dine-in'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={statusStr === 'completed' ? 'success' : statusStr === 'pending' ? 'warning' : 'primary'} size="sm">
                      {statusStr}
                    </Badge>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(amount)}</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
