import { useEffect, useState } from 'react';
import { Card, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { inventoryApi } from '@/api';
import type { Column } from '@/components/ui';
import type { InventoryItem } from '@/types';

type InventoryRow = InventoryItem & { _id?: string };

const columns: Column<InventoryRow>[] = [
  { key: 'name', header: 'Item' },
  { key: 'category', header: 'Category' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'unit', header: 'Unit' },
  {
    key: 'minStockLevel',
    header: 'Min Stock',
    render: (item) => (
      <Badge variant={item.quantity <= item.minStockLevel ? 'error' : 'success'} size="sm">
        {item.minStockLevel}
      </Badge>
    ),
  },
];

export default function Inventory() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await inventoryApi.getAll({ q: search, limit: 50 });
        const normalizedItems = response.data.data.map((item) => ({
          ...item,
          id: item.id ?? String((item as any)._id ?? ''),
        })) as InventoryRow[];

        setItems(normalizedItems);
      } catch (fetchError) {
        setError('Unable to load inventory items. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [search]);

  const lowStockCount = items.filter((item) => item.quantity <= item.minStockLevel).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track your inventory levels and avoid stockouts"
        actions={
          <Search
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        }
      />

      <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Low stock items</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{lowStockCount}</p>
          </div>
          <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total inventory lines</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{items.length}</p>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="rounded-[1.5rem] border-red-200 bg-red-50 text-red-800">
          <CardContent>{error}</CardContent>
        </Card>
      ) : null}

      <Card padding="none">
        <Table columns={columns} data={items} isLoading={isLoading} />
      </Card>
    </div>
  );
}

