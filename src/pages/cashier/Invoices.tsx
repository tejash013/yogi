import { Card, Table, Badge, Search, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface InvoiceRow {
  invoice: string;
  order: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

const data: InvoiceRow[] = [
  { invoice: 'INV-001', order: 'ORD-001', customer: 'John Doe', amount: 38.85, status: 'paid', date: '2025-03-20' },
  { invoice: 'INV-002', order: 'ORD-002', customer: 'Jane Smith', amount: 41.41, status: 'paid', date: '2025-03-20' },
  { invoice: 'INV-003', order: 'ORD-003', customer: 'Mike Johnson', amount: 25.89, status: 'pending', date: '2025-03-19' },
  { invoice: 'INV-004', order: 'ORD-004', customer: 'Sarah Wilson', amount: 52.30, status: 'overdue', date: '2025-03-15' },
];

const columns: Column<InvoiceRow>[] = [
  { key: 'invoice', header: 'Invoice' },
  { key: 'order', header: 'Order' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Amount', render: (item) => `$${item.amount.toFixed(2)}` },
  {
    key: 'status',
    header: 'Status',
    render: (item) => {
      const variant = item.status === 'paid' ? 'success' : item.status === 'pending' ? 'warning' : 'error';
      return (
        <Badge variant={variant} size="sm">
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      );
    },
  },
  { key: 'date', header: 'Date' },
];

export default function Invoices() {
  return (
    <div>
      <PageHeader
        title="Invoices"
        description="View and manage invoices"
        actions={
          <div className="flex items-center gap-3">
            <Search placeholder="Search invoices..." />
            <Button variant="outline">Export</Button>
          </div>
        }
      />
      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}
