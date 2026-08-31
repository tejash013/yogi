import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { inventoryApi } from '@/api';
import { useTenantStore } from '@/store';
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
  const { branchId, currentBranch } = useTenantStore();
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'General',
    quantity: '0',
    unit: 'kg',
    unitPrice: '0',
    supplier: '',
    minStockLevel: '0',
    maxStockLevel: '0',
  });

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
    } catch {
      setError('Unable to load inventory items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchInventory();
  }, [search, branchId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await inventoryApi.create({
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity || 0),
        unit: form.unit,
        unitPrice: Number(form.unitPrice || 0),
        supplier: form.supplier || 'N/A',
        minStockLevel: Number(form.minStockLevel || 0),
        maxStockLevel: Number(form.maxStockLevel || 0),
      });
      setForm({ name: '', category: 'General', quantity: '0', unit: 'kg', unitPrice: '0', supplier: '', minStockLevel: '0', maxStockLevel: '0' });
      setShowForm(false);
      await fetchInventory();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create inventory item.');
    } finally {
      setIsSaving(false);
    }
  };

  const lowStockCount = items.filter((item) => item.quantity <= item.minStockLevel).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock & Inventory"
        description={`Track inventory levels, ingredients, and alerts for ${currentBranch?.name || 'Main Hall'}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <TenantSelector variant="pill" />
            <Search
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
            <Button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close' : 'Add Item'}</Button>
          </div>
        }
      />

      {showForm ? (
        <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Item name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Quantity</label>
                <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Unit price</label>
                <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Supplier</label>
                <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Min stock</label>
                <input type="number" min="0" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Max stock</label>
                <input type="number" min="0" value={form.maxStockLevel} onChange={(e) => setForm({ ...form, maxStockLevel: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save item'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

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

