import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, Badge, Table, Button, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface OrderRow {
  order: string;
  customer: string;
  table: number;
  items: number;
  total: number;
  status: string;
}

const data: OrderRow[] = [
  { order: 'ORD-001', customer: 'John Doe', table: 5, items: 3, total: 38.85, status: 'Preparing' },
  { order: 'ORD-002', customer: 'Jane Smith', table: 3, items: 2, total: 41.41, status: 'Completed' },
  { order: 'ORD-003', customer: 'Mike Johnson', table: 8, items: 4, total: 25.89, status: 'Pending' },
];

const statusColors: Record<string, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  confirmed: 'primary',
  preparing: 'primary',
  ready: 'success',
  completed: 'success',
};

const statusOptions = ['All', 'Pending', 'Preparing', 'Completed'] as const;

const columns: Column<OrderRow>[] = [
  { key: 'order', header: 'Order' },
  { key: 'customer', header: 'Customer' },
  { key: 'table', header: 'Table' },
  { key: 'items', header: 'Items' },
  { key: 'total', header: 'Total', render: (item) => `$${item.total.toFixed(2)}` },
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
  const [statusFilter, setStatusFilter] = useState<typeof statusOptions[number]>('All');
  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(
    () =>
      data.filter((order) => {
        const matchesStatus =
          statusFilter === 'All' || order.status === statusFilter;
        const matchesSearch =
          order.order.toLowerCase().includes(search.toLowerCase()) ||
          order.customer.toLowerCase().includes(search.toLowerCase()) ||
          order.status.toLowerCase().includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
      }),
    [statusFilter, search]
  );

  const orderCount = filteredOrders.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track live order progress and manage kitchen flow"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search placeholder="Search orders..." />
            <Button variant="outline">Filter</Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {statusOptions.map((status) => {
          const matchingCount =
            status === 'All'
              ? data.length
              : data.filter((order) => order.status === status).length;

          return (
            <Card key={status} className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{status}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-3xl font-semibold text-neutral-900 dark:text-white">{matchingCount}</p>
                <Badge variant={status === 'Completed' ? 'success' : status === 'Pending' ? 'warning' : 'primary'} size="sm">Live</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
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
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            Showing {orderCount} of {data.length} orders.
          </div>
          <Table columns={columns} data={filteredOrders} />
        </CardContent>
      </Card>
    </div>
  );
}

