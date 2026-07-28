import { Button, Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const categories = [
  { name: 'Pizza', items: 8, icon: '🍕', active: true },
  { name: 'Main Course', items: 15, icon: '🍽️', active: true },
  { name: 'Salads', items: 6, icon: '🥗', active: true },
  { name: 'Desserts', items: 10, icon: '🍰', active: true },
  { name: 'Beverages', items: 9, icon: '🥤', active: false },
];

export default function Categories() {
  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage menu categories"
        actions={<Button>Add Category</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.name}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{cat.name}</p>
                  <p className="text-sm text-neutral-500">{cat.items} items</p>
                </div>
              </div>
              <Badge variant={cat.active ? 'success' : 'neutral'} size="sm">
                {cat.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

