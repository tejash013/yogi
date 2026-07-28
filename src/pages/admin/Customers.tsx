import { Card, Table, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface CustomerRow {
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
}

const data: CustomerRow[] = [
  { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0101', orders: 12, spent: 245.50 },
  { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0102', orders: 8, spent: 189.20 },
  { name: 'Mike Johnson', email: 'mike@example.com', phone: '+1-555-0103', orders: 5, spent: 98.75 },
];

const columns: Column<CustomerRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'orders', header: 'Orders' },
  { key: 'spent', header: 'Total Spent', render: (item) => `$${item.spent.toFixed(2)}` },
];

export default function Customers() {
  return (
    <div>
      <PageHeader
        title="Customers"
        description="View your customer base"
        actions={<Search placeholder="Search customers..." />}
      />
      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

