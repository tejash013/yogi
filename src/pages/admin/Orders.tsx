import { Card, Badge, Table, Button, Search } from '@/components/ui';
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
  { order: 'ORD-001', customer: 'John Doe', table: 5, items: 3, total: 38.85, status: 'preparing' },
  { order: 'ORD-002', customer: 'Jane Smith', table: 3, items: 2, total: 41.41, status: 'completed' },
  { order: 'ORD-003', customer: 'Mike Johnson', table: 8, items: 4, total: 25.89, status: 'pending' },
];

const statusColors: Record<string, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  confirmed: 'primary',
  preparing: 'primary',
  ready: 'success',
  completed: 'success',
};

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
      <Badge variant={statusColors[item.status] || 'neutral'} size="sm">
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Badge>
    ),
  },
];

export default function AdminOrders() {
  return (
    <div>
      <PageHeader
        title="Orders"
        description="View and manage all orders"
        actions={
          <div className="flex items-center gap-3">
            <Search placeholder="Search orders..." />
            <Button variant="outline">Filter</Button>
          </div>
        }
      />
      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

