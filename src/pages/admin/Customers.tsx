import { Card, CardHeader, CardContent, Table, Search } from '@/components/ui';
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
  { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0101', orders: 12, spent: 245.5 },
  { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0102', orders: 8, spent: 189.2 },
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
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="View your customer base and recent activity"
        actions={<Search placeholder="Search customers..." />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
          <CardHeader>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer insights</p>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Loyalty and orders</h3>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total customers</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">3</p>
            </div>
            <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Average spend</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">$177</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer satisfaction</p>
          <div className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            <p>Retention is strong across repeat buyers.</p>
            <p>Use customer insights to personalize your offers.</p>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

