import { Card, Table, Badge, Search } from '@/components/ui';
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
    <div>
      <PageHeader
        title="Inventory"
        description="Track your inventory levels"
        actions={<Search placeholder="Search inventory..." />}
      />
      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

