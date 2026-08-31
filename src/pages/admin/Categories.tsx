import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Badge, CardHeader, CardContent, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { categoriesApi, menuApi } from '@/api';
import { useOrderSyncStore } from '@/store';

type CategoryRow = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  active: boolean;
  icon: string;
};

const categoryIcons = ['🍕', '🍽️', '🥗', '🍰', '🥤', '🌮', '🍜', '☕'];

export default function Categories() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const syncVersion = useOrderSyncStore((state) => state.version);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '🍽️' });

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const [categoryResponse, menuResponse] = await Promise.all([
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
          menuApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        const categoryList = Array.isArray(categoryResponse?.data?.data)
          ? categoryResponse.data.data
          : Array.isArray(categoryResponse?.data)
            ? categoryResponse.data
            : [];
        const menuList = Array.isArray(menuResponse?.data?.data)
          ? menuResponse.data.data
          : Array.isArray(menuResponse?.data)
            ? menuResponse.data
            : [];

        const itemCounts = new Map<string, number>();
        menuList.forEach((item: any) => {
          const categoryId = String(item?.category?._id ?? item?.category ?? item?.categoryId ?? '');
          if (!categoryId) return;
          itemCounts.set(categoryId, (itemCounts.get(categoryId) ?? 0) + 1);
        });

        const mapped = categoryList.map((category: any, index: number) => ({
          id: String(category?._id ?? category?.id ?? `cat-${index}`),
          name: category?.name ?? 'Unnamed category',
          description: category?.description ?? 'Menu grouping',
          itemCount: itemCounts.get(String(category?._id ?? category?.id ?? '')) ?? 0,
          active: category?.isActive ?? true,
          icon: categoryIcons[index % categoryIcons.length],
        }));

        setCategories(mapped);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, [syncVersion]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const activeCount = filteredCategories.filter((cat) => cat.active).length;
  const totalItems = filteredCategories.reduce((count, cat) => count + cat.itemCount, 0);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setCreateError('Category name is required.');
      return;
    }

    setIsSaving(true);
    setCreateError('');

    try {
      await categoriesApi.create({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || 'Curated menu section',
        icon: newCategory.icon,
      });

      useOrderSyncStore.getState().notifyResourceChange({
        type: 'create',
        resource: 'category',
        at: new Date().toISOString(),
      });

      setNewCategory({ name: '', description: '', icon: '🍽️' });
      setShowCreateForm(false);
      const categoryResponse = await categoriesApi.getAll().catch(() => ({ data: { data: [] } }));
      const categoryList = Array.isArray(categoryResponse?.data?.data) ? categoryResponse.data.data : [];
      const menuResponse = await menuApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } }));
      const menuList = Array.isArray(menuResponse?.data?.data) ? menuResponse.data.data : [];
      const itemCounts = new Map<string, number>();
      menuList.forEach((item: any) => {
        const categoryId = String(item?.category?._id ?? item?.category ?? item?.categoryId ?? '');
        if (!categoryId) return;
        itemCounts.set(categoryId, (itemCounts.get(categoryId) ?? 0) + 1);
      });

      setCategories((categoryList as any[]).map((category: any, index: number) => ({
        id: String(category?._id ?? category?.id ?? `cat-${index}`),
        name: category?.name ?? 'Unnamed category',
        description: category?.description ?? 'Menu grouping',
        itemCount: itemCounts.get(String(category?._id ?? category?.id ?? '')) ?? 0,
        active: category?.isActive ?? true,
        icon: category?.icon ?? categoryIcons[index % categoryIcons.length],
      })));
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create category.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your menu into flexible category groups"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
            <Button
              onClick={() => setShowCreateForm((current) => !current)}
              className="rounded-full bg-[#171412] text-white hover:bg-[#2a241f] dark:bg-[#f3d7a2] dark:text-[#171412]"
            >
              {showCreateForm ? 'Close' : 'Add Category'}
            </Button>
          </div>
        }
      />

      {showCreateForm ? (
        <Card className="rounded-[28px] border-[#efe4d7] bg-[#fffdfb] p-6 shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid gap-4 md:grid-cols-[1.2fr_1.3fr_0.7fr]">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Category name</label>
              <input value={newCategory.name} onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800" placeholder="Signature mains" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Description</label>
              <input value={newCategory.description} onChange={(event) => setNewCategory((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800" placeholder="Chef-selected favorites" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Icon</label>
              <input value={newCategory.icon} onChange={(event) => setNewCategory((current) => ({ ...current, icon: event.target.value || '🍽️' }))} className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 text-lg dark:border-neutral-700 dark:bg-neutral-800" maxLength={2} />
            </div>
          </div>
          {createError ? <p className="mt-3 text-sm text-red-600">{createError}</p> : null}
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            <Button type="button" onClick={() => void handleCreateCategory()} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Category'}</Button>
          </div>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="min-w-0 overflow-hidden rounded-[28px] border-[#efe4d7] bg-gradient-to-br from-[#201a17] via-[#1a1715] to-[#2d241f] p-0 shadow-[0_20px_60px_rgba(42,33,28,0.15)] dark:border-neutral-700">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(231,189,117,0.22),_transparent_40%)] p-6">
            <CardHeader className="mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0d7aa]">Category performance</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Top categories</h3>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[24px] border border-[#d6b07a]/40 bg-[#f6d9a1]/10 p-5 text-white shadow-inner">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#f0d7aa]">Active categories</p>
                <p className="mt-4 text-4xl font-semibold text-white">{activeCount}</p>
                <p className="mt-2 text-sm text-[#f5ebdc]">Showing {filteredCategories.length} categories in current search.</p>
              </div>
              <div className="grid gap-3 rounded-[24px] border border-[#3d3129] bg-[#120f0d]/50 p-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#d7c9b7]">Total categories</span>
                  <span className="font-semibold text-white">{filteredCategories.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#d7c9b7]">Items in categories</span>
                  <span className="font-semibold text-white">{totalItems}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {isLoading ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-[#eadcc7] bg-[#f9f4ee] p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-[#eadcc7] bg-[#f9f4ee] p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              No categories found for this search.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <Card key={cat.id} className="min-w-0 overflow-hidden rounded-[28px] border-[#efe4d7] bg-[#fffdfb] p-0 shadow-[0_16px_40px_rgba(85,68,44,0.06)] dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex flex-col gap-4 p-5">
                  <div className="relative min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f9efd9] text-2xl shadow-sm dark:bg-[#2c251f]">{cat.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-normal break-words text-lg font-semibold text-neutral-900 dark:text-white">{cat.name}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{cat.itemCount} items</p>
                      </div>
                    </div>
                    <Badge variant={cat.active ? 'success' : 'neutral'} size="sm" className="absolute right-0 top-0 rounded-full">
                      {cat.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="break-words rounded-[20px] bg-[#f8f3ee] px-4 py-3 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {cat.description || 'Category overview with live menu data.'}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

