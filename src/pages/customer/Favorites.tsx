import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { FoodCard } from '@/components/customer';
import { ROUTES } from '@/constants';
import type { MenuItem } from '@/types';
import menuData from '@/data/menu.json';

const menuItems = menuData as MenuItem[];

export default function Favorites() {
  const [favorites, setFavorites] = useState<string[]>(['menu-001', 'menu-004', 'menu-006']);
  const favoriteItems = menuItems.filter((item) => favorites.includes(item.id));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fid) => fid !== id));
  };

  if (favoriteItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">No favorites yet</h2>
        <p className="mb-6 text-sm text-neutral-500">Save your favorite dishes for quick access</p>
        <Link to={ROUTES.CUSTOMER.MENU}>
          <Button size="lg">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          My Favorites ({favoriteItems.length})
        </h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favoriteItems.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            isFavorite={true}
            onFavoriteToggle={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

