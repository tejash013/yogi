import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { categoriesApi, menuApi } from '@/api';
import type { Column } from '@/components/ui';

type MenuItemRow = {
  id?: string;
  title: string;
  category: string;
  price: number;
  status: string;
  rating: number;
};

const columns: Column<MenuItemRow>[] = [
  { key: 'title', header: 'Name' },
  { key: 'category', header: 'Category' },
  { key: 'price', header: 'Price', render: (item) => `₹${item.price.toFixed(2)}` },
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
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '0',
    image: '',
    tags: '',
    isPopular: false,
    isRecommended: false,
  });

  const loadData = async () => {
    try {
      const [menuResponse, categoryResponse] = await Promise.all([
        menuApi.getAll({ page: 1, limit: 100 }),
        categoriesApi.getAll(),
      ]);

      const nextItems = (menuResponse.data.data ?? []).map((item: any) => ({
        id: item._id ?? item.id,
        title: item.title ?? item.name,
        category: item.categoryName ?? item.category?.name ?? 'General',
        price: Number(item.price ?? 0),
        status: item.isActive === false ? 'Out of Stock' : 'Available',
        rating: Number(item.rating ?? 4.5),
      }));

      setItems(nextItems);
      setCategories((categoryResponse.data.data ?? []).map((category: any) => ({
        id: category._id ?? category.id,
        name: category.name,
      })));
    } catch {
      setError('Unable to load menu items. Please try again later.');
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const availableCount = filteredItems.filter((item) => item.status === 'Available').length;
  const outOfStockCount = filteredItems.filter((item) => item.status !== 'Available').length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (!form.title || !form.category) {
        throw new Error('Menu name and category are required.');
      }

      await menuApi.create({
        title: form.title,
        description: form.description || 'New menu item',
        category: form.category,
        price: Number(form.price || 0),
        image: form.image || undefined,
        tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        isPopular: form.isPopular,
        isRecommended: form.isRecommended,
      });

      setForm({ title: '', description: '', category: '', price: '0', image: '', tags: '', isPopular: false, isRecommended: false });
      setShowForm(false);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create menu item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items and availability"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
            <Button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close' : 'Add New Item'}</Button>
          </div>
        }
      />

      {showForm ? (
        <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Menu item name</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" rows={3} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Price</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Tags</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" placeholder="vegetarian, healthy, popular" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} /> Popular</label>
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200"><input type="checkbox" checked={form.isRecommended} onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })} /> Recommended</label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save item'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="rounded-[1.5rem] border-red-200 bg-red-50 text-red-800">
          <CardContent>{error}</CardContent>
        </Card>
      ) : null}

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
            <Button variant="outline" onClick={() => void loadData()}>Sync Menu</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={columns} data={filteredItems} />
        </CardContent>
      </Card>
    </div>
  );
}

