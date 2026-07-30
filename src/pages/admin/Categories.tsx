import { useMemo, useState } from 'react';
import { Button, Card, Badge, CardHeader, CardContent, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';

const categories = [
  { name: 'Pizza', items: 8, icon: '🍕', active: true },
  { name: 'Main Course', items: 15, icon: '🍽️', active: true },
  { name: 'Salads', items: 6, icon: '🥗', active: true },
  { name: 'Desserts', items: 10, icon: '🍰', active: true },
  { name: 'Beverages', items: 9, icon: '🥤', active: false },
];

export default function Categories() {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const activeCount = filteredCategories.filter((cat) => cat.active).length;
  const totalItems = filteredCategories.reduce((count, cat) => count + cat.items, 0);

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
            <Button>Add Category</Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[1.5rem] border-neutral-200 bg-white/90 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900/90">
          <CardHeader>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Category performance</p>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Top categories</h3>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-3xl bg-primary-500 p-5 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-primary-100/80">Active categories</p>
              <p className="mt-4 text-4xl font-semibold">{activeCount}</p>
              <p className="mt-2 text-sm text-primary-100/90">Showing {filteredCategories.length} categories in current search.</p>
            </div>
            <div className="grid gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Total categories</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{filteredCategories.length}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Items in categories</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{totalItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => (
            <Card key={cat.name} className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{cat.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{cat.items} items</p>
                    </div>
                  </div>
                  <Badge variant={cat.active ? 'success' : 'neutral'} size="sm">
                    {cat.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                  Category overview with quick actions in the future.
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

