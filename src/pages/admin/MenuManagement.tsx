import { useState } from 'react';
import { Button, Card, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface MenuItemRow {
  name: string;
  category: string;
  price: number;
  status: string;
  rating: number;
}

const data: MenuItemRow[] = [
  { name: 'Margherita Pizza', category: 'Pizza', price: 12.99, status: 'Available', rating: 4.5 },
  { name: 'Grilled Salmon', category: 'Main Course', price: 24.99, status: 'Available', rating: 4.7 },
  { name: 'Caesar Salad', category: 'Salads', price: 9.99, status: 'Available', rating: 4.3 },
  { name: 'Chocolate Lava Cake', category: 'Desserts', price: 8.99, status: 'Out of Stock', rating: 4.8 },
];

const columns: Column<MenuItemRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'category', header: 'Category' },
  { key: 'price', header: 'Price', render: (item) => `$${item.price.toFixed(2)}` },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <Badge variant={item.status === 'Available' ? 'success' : 'error'} size="sm">
        {item.status}
      </Badge>
    ),
  },
  { key: 'rating', header: 'Rating' },
];

export default function MenuManagement() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items"
        actions={
          <div className="flex items-center gap-3">
            <Search placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
            <Button>Add New Item</Button>
          </div>
        }
      />

      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

