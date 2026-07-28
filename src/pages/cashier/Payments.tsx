import { Button, Card, Table, Badge, Search, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface PaymentRow {
  id: string;
  order: string;
  customer: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

const data: PaymentRow[] = [
  { id: '1', order: 'ORD-001', customer: 'John Doe', amount: 38.85, method: 'Cash', status: 'completed', date: '2025-03-20' },
  { id: '2', order: 'ORD-002', customer: 'Jane Smith', amount: 41.41, method: 'Card', status: 'completed', date: '2025-03-20' },
  { id: '3', order: 'ORD-003', customer: 'Mike Johnson', amount: 25.89, method: 'UPI', status: 'pending', date: '2025-03-19' },
  { id: '4', order: 'ORD-004', customer: 'Sarah Wilson', amount: 52.30, method: 'Online', status: 'failed', date: '2025-03-18' },
];

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'info',
};

const columns: Column<PaymentRow>[] = [
  { key: 'order', header: 'Order' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Amount', render: (item: PaymentRow) => '$' + item.amount.toFixed(2) },
  { key: 'method', header: 'Method' },
  {
    key: 'status',
    header: 'Status',
    render: (item: PaymentRow) => (
      <Badge variant={statusColors[item.status] || 'neutral'} size='sm'>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Badge>
    ),
  },
  { key: 'date', header: 'Date' },
];

export default function Payments() {
  return (
    <div>
      <PageHeader
        title='Payments'
        description='Track and manage payments'
        actions={
          <div className='flex items-center gap-3'>
            <Search placeholder='Search payments...' />
            <Select
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'online', label: 'Online' },
              ]}
              placeholder='Filter'
            />
          </div>
        }
      />
      <Card padding='none'>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}
