import { useMemo, useState } from 'react';
import { Button, Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
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

  const filteredItems = useMemo(
    () =>
      data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const availableCount = filteredItems.filter((item) => item.status === 'Available').length;
  const outOfStockCount = filteredItems.filter((item) => item.status !== 'Available').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items and availability"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
            <Button>Add New Item</Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Total items</p>
          <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">{filteredItems.length}</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Search results are updated live.</p>
        </Card>
        <Card className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Available</p>
          <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">{availableCount}</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Includes dishes ready to serve.</p>
        </Card>
        <Card className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Out of stock</p>
          <p className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">{outOfStockCount}</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Filtered count for unavailable items.</p>
        </Card>
      </div>

      <Card padding="none">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Menu items</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Browse and maintain all dishes in your restaurant menu.</p>
            </div>
            <Button variant="outline">Sync Menu</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={columns} data={filteredItems} />
        </CardContent>
      </Card>
    </div>
  );
}

