import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, Badge, Table, Button, Search } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { ordersApi } from '@/api';
import { useOrderSyncStore, useTenantStore } from '@/store';
import type { Column } from '@/components/ui';

interface OrderRow {
  id: string;
  order: string;
  customer: string;
  table?: number;
  items: number;
  total: number;
  status: string;
}

const statusColors: Record<string, 'warning' | 'primary' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'primary',
  preparing: 'primary',
  ready: 'success',
  completed: 'success',
  cancelled: 'error',
};

const statusOptions = ['All', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

type StatusFilter = typeof statusOptions[number];

const columns: Column<OrderRow>[] = [
  { key: 'order', header: 'Order' },
  { key: 'customer', header: 'Customer' },
  {
    key: 'table',
    header: 'Table',
    render: (item) => {
      if (!item.table) return '—';
      if (typeof item.table === 'object') {
        return (item.table as any).label ? `#${(item.table as any).label}` : '—';
      }
      return `#${item.table}`;
    },
  },
  { key: 'items', header: 'Items' },
  { key: 'total', header: 'Total', render: (item) => `₹${item.total.toFixed(2)}` },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <Badge variant={statusColors[item.status.toLowerCase()] || 'neutral'} size="sm">
        {item.status}
      </Badge>
    ),
  },
];

export default function AdminOrders() {
  const { branchId, currentBranch } = useTenantStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const orderSyncVersion = useOrderSyncStore((state) => state.version);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const response = await ordersApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } }));
        const list = Array.isArray(response?.data?.data) ? response.data.data : [];

        const mapped = list.map((order: any) => {
          const user = order?.user ?? {};
          const customerName = user?.firstName || user?.name
            ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.name || 'Guest Customer'
            : 'Guest Customer';

          const itemCount = Array.isArray(order?.items) ? order.items.length : 0;
          const total = Number(order?.total ?? order?.subtotal ?? 0);
          const tableValue = typeof order?.table === 'object' ? order.table?.label : order?.table;
          const tableNumber = tableValue ? Number.parseInt(String(tableValue).replace(/\D/g, ''), 10) : Number(order?.tableNumber);

          return {
            id: String(order?._id ?? order?.id ?? `ord-${Math.random()}`),
            order: order?.orderNumber ?? `ORD-${String(order?._id ?? order?.id ?? '000').slice(-6).toUpperCase()}`,
            customer: customerName,
            table: Number.isFinite(tableNumber) ? tableNumber : undefined,
            items: itemCount,
            total,
            status: String(order?.status ?? 'pending').charAt(0).toUpperCase() + String(order?.status ?? 'pending').slice(1),
          };
        });

        setOrders(mapped);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [orderSyncVersion, branchId]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesStatus =
          statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch =
          order.order.toLowerCase().includes(search.toLowerCase()) ||
          order.customer.toLowerCase().includes(search.toLowerCase()) ||
          order.status.toLowerCase().includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
      }),
    [orders, statusFilter, search]
  );

  const orderCount = filteredOrders.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Orders"
        description={`Track orders, dine-in tables, and status for ${currentBranch?.name || 'Main Hall'}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <TenantSelector variant="pill" />
            <Search placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
            <Button
              variant="outline"
              onClick={() => setShowFilters((current) => !current)}
              className="rounded-full border-[#d9c2a4] bg-white text-[#241d18] hover:bg-[#f7eddc] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            >
              {showFilters ? 'Hide filters' : 'Filter'}
            </Button>
          </div>
        }
      />

      {showFilters ? (
        <Card className="rounded-[24px] border-[#efe4d7] bg-[#fffdfb] p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setShowFilters(false);
                }}
                className={statusFilter === status ? 'rounded-full bg-[#171412] text-white hover:bg-[#2a241f]' : 'rounded-full border-[#d9c2a4] bg-white text-[#241d18] hover:bg-[#f7eddc] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white'}
              >
                {status}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {statusOptions.map((status) => {
          const matchingCount =
            status === 'All'
              ? orders.length
              : orders.filter((order) => order.status.toLowerCase() === status.toLowerCase()).length;

          return (
            <Card key={status} className="rounded-[28px] border-[#eee2d4] bg-[#fffdfb] p-5 shadow-[0_18px_50px_rgba(83,67,45,0.05)] dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{status === 'All' ? 'All orders' : status}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-3xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{matchingCount}</p>
                <Badge variant={status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : status === 'pending' ? 'warning' : 'primary'} size="sm" className="rounded-full">Live</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-[30px] border-[#efe4d7] bg-[#fffdfb] shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
        <CardHeader className="border-b border-[#f0e4d7] bg-[#f9f4ee] px-5 py-4 dark:border-neutral-700 dark:bg-neutral-800/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Order log</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Recent orders and totals.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Search
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
              />
              <div className="flex flex-wrap items-center gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'rounded-full bg-[#171412] text-white hover:bg-[#2a241f]' : 'rounded-full border-[#d9c2a4] bg-white text-[#241d18] hover:bg-[#f7eddc] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white'}
                  >
                    {status === 'All' ? 'All' : status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="mb-4 rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            Showing {orderCount} of {orders.length} orders.
          </div>
          {isLoading ? (
            <div className="rounded-[22px] border border-dashed border-[#eadcc7] bg-[#f9f4ee] p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              Loading orders...
            </div>
          ) : (
            <Table columns={columns} data={filteredOrders} emptyMessage="No orders match this filter." className="rounded-[20px] border-[#f0e4d7]" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

