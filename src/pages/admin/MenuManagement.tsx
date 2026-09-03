import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { categoriesApi, menuApi } from '@/api';
import { APP_CONFIG } from '@/constants';
import { useOrderSyncStore } from '@/store';
import type { Column } from '@/components/ui';

type MenuItemRow = {
  id?: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  price: number;
  availableQty: number;
  image: string;
  tags: string[];
  isPopular: boolean;
  isRecommended: boolean;
  status: string;
  rating: number;
};

export default function MenuManagement() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const syncVersion = useOrderSyncStore((state) => state.version);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '0',
    availableQty: '10',
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
        description: item.description ?? '',
        category: item.categoryName ?? item.category?.name ?? 'General',
        categoryId: item.category?._id ?? item.categoryId ?? item.category ?? '',
        price: Number(item.price ?? 0),
        availableQty: Number(item.availableQty ?? 0),
        image: item.image ?? '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        isPopular: Boolean(item.isPopular),
        isRecommended: Boolean(item.isRecommended),
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
  }, [syncVersion]);

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
      const availableQty = Number(form.availableQty);
      if (!Number.isInteger(availableQty) || availableQty < 0) {
        throw new Error('Availability quantity must be a whole number of zero or more.');
      }

      const payload = {
        title: form.title,
        description: form.description || 'New menu item',
        category: form.category,
        price: Number(form.price || 0),
        availableQty,
        image: form.image || undefined,
        tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        isPopular: form.isPopular,
        isRecommended: form.isRecommended,
      };

      if (editingId) {
        await menuApi.update(editingId, payload);
      } else {
        await menuApi.create(payload);
      }

      useOrderSyncStore.getState().notifyResourceChange({
        type: 'create',
        resource: 'menu',
        at: new Date().toISOString(),
      });

      setForm({ title: '', description: '', category: '', price: '0', availableQty: '10', image: '', tags: '', isPopular: false, isRecommended: false });
      setEditingId(undefined);
      setShowForm(false);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create menu item.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: '', price: '0', availableQty: '10', image: '', tags: '', isPopular: false, isRecommended: false });
    setEditingId(undefined);
    setShowForm(false);
  };

  const editItem = (item: MenuItemRow) => {
    setForm({
      title: item.title,
      description: item.description,
      category: item.categoryId,
      price: String(item.price),
      availableQty: String(item.availableQty),
      image: item.image,
      tags: item.tags.join(', '),
      isPopular: item.isPopular,
      isRecommended: item.isRecommended,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > APP_CONFIG.MAX_UPLOAD_SIZE) {
      setError('Please choose an image smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const columns: Column<MenuItemRow>[] = [
    {
      key: 'title',
      header: 'Name',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image ? <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800" />}
          <span>{item.title}</span>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'availableQty', header: 'Available Qty', render: (item) => `${item.availableQty} available` },
    { key: 'price', header: 'Price', render: (item) => `₹${item.price.toFixed(2)}` },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge variant={item.status === 'Available' ? 'success' : 'error'} size="sm">{item.status}</Badge>,
    },
    { key: 'rating', header: 'Rating' },
    { key: 'id', header: 'Actions', render: (item) => <Button size="sm" variant="outline" onClick={() => editItem(item)}>Edit</Button> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items and availability"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
            <Button onClick={() => (showForm ? resetForm() : setShowForm(true))}>{showForm ? 'Close' : 'Add New Item'}</Button>
          </div>
        }
      />

      {showForm ? (
        <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">{editingId ? 'Edit menu item' : 'Add menu item'}</h2>
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
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Availability quantity</label>
                <input type="number" min="0" step="1" value={form.availableQty} onChange={(e) => setForm({ ...form, availableQty: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" placeholder="https://..." />
                <label className="mt-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Or choose from disk</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0])} className="w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:font-semibold file:text-primary-700 dark:text-neutral-300 dark:file:bg-primary-950 dark:file:text-primary-300" />
                {form.image ? <img src={form.image} alt="Selected menu item" className="mt-2 h-24 w-24 rounded-xl object-cover" /> : null}
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
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : editingId ? 'Update item' : 'Save item'}</Button>
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

