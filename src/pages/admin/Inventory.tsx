import { Card, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface InventoryRow {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
}

const data: InventoryRow[] = [
  { name: 'Tomatoes', category: 'Vegetables', quantity: 50, unit: 'kg', minStock: 20 },
  { name: 'Chicken Breast', category: 'Meat', quantity: 15, unit: 'kg', minStock: 10 },
  { name: 'Mozzarella', category: 'Dairy', quantity: 8, unit: 'kg', minStock: 5 },
  { name: 'Olive Oil', category: 'Pantry', quantity: 3, unit: 'L', minStock: 5 },
];

const columns: Column<InventoryRow>[] = [
  { key: 'name', header: 'Item' },
  { key: 'category', header: 'Category' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'unit', header: 'Unit' },
  {
    key: 'minStock',
    header: 'Min Stock',
    render: (item) => (
      <Badge variant={item.quantity <= item.minStock ? 'error' : 'success'} size="sm">
        {item.minStock}
      </Badge>
    ),
  },
];

export default function Inventory() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track your inventory levels and avoid stockouts"
        actions={<Search placeholder="Search inventory..." />}
      />

      <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Low stock items</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">2</p>
          </div>
          <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total inventory lines</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">4</p>
          </div>
        </CardContent>
      </Card>

      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

