import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FoodCard, LoadingSkeleton } from '@/components/customer';
import { categoriesApi, menuApi } from '@/api';
import { useCartStore, useOrderSyncStore, useTenantStore } from '@/store';
import type { MenuItem, Category } from '@/types';

const FAVORITES_STORAGE_KEY = 'yogi_favorites';

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('shake') || lower.includes('juice')) return '🥤';
  if (lower.includes('coffee') || lower.includes('tea')) return '☕';
  if (lower.includes('extra') || lower.includes('side') || lower.includes('snack')) return '🍿';
  if (lower.includes('dessert') || lower.includes('ice cream') || lower.includes('sweet')) return '🍦';
  if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('chinese')) return '🍜';
  if (lower.includes('main') || lower.includes('thali') || lower.includes('dish')) return '🍛';
  return '🍽️';
}

const normalizeMenuItem = (item: any): MenuItem => ({
  id: String(item._id ?? item.id ?? ''),
  name: item.title ?? item.name,
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
  categoryId: String(item.category?._id ?? item.categoryId ?? item.category ?? ''),
  categoryName: item.categoryName ?? item.category?.name ?? 'General',
  image: item.image ?? '/images/placeholder.jpg',
  images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image ?? '/images/placeholder.jpg'],
  ingredients: item.ingredients ?? [],
  allergens: item.allergens ?? [],
  nutritionalInfo: item.nutritionalInfo ?? { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  isAvailable: item.isAvailable ?? item.isActive ?? true,
  isPopular: Boolean(item.isPopular),
  isRecommended: Boolean(item.isRecommended),
  preparationTime: item.preparationTime ?? 15,
  rating: Number(item.rating ?? 4.5),
  totalReviews: Number(item.totalReviews ?? 0),
  tags: item.tags ?? [],
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const normalizeCategory = (item: any): Category => ({
  id: String(item._id ?? item.id ?? ''),
  name: item.name ?? 'Category',
  description: item.description ?? '',
  image: item.image ?? '/images/category.jpg',
  icon: item.icon ?? '🍽️',
  isActive: item.isActive ?? true,
  sortOrder: item.sortOrder ?? 0,
  itemCount: item.itemCount ?? 0,
  createdAt: item.createdAt ?? new Date().toISOString(),
});

export default function Menu() {
  const { currentRestaurant, currentBranch, branchId } = useTenantStore();
  const isOutletPaused = currentRestaurant?.isActive === false || currentBranch?.isActive === false;
  const tableNumber = useCartStore((s) => s.tableNumber);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const syncVersion = useOrderSyncStore((state) => state.version);

  const activeBranchId = branchId || currentBranch?._id || localStorage.getItem('restaurantos-branch-id');
  const activeRestaurantId = currentRestaurant?._id || localStorage.getItem('restaurantos-restaurant-id');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuRes, categoriesRes] = await Promise.all([
          menuApi.getAllItems({ branchId: activeBranchId || undefined, restaurantId: activeRestaurantId || undefined }).catch(() => []),
          categoriesApi.getAll({ branchId: activeBranchId || undefined, restaurantId: activeRestaurantId || undefined } as any).catch(() => ({ data: { data: [] } })),
        ]);

        const items = Array.isArray(menuRes) ? menuRes : [];
        const categoryList = Array.isArray(categoriesRes?.data?.data) ? categoriesRes.data.data : Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];

        setMenuItems(items.map(normalizeMenuItem));
        setCategories(categoryList.map(normalizeCategory));
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [syncVersion, branchId, activeBranchId, activeRestaurantId]);

  let filtered = [...menuItems];

  // Filter menu by current active branch and restaurant
  if (activeBranchId || activeRestaurantId) {
    filtered = filtered.filter((item: any) => {
      const bId = item.branchId || item.branch?._id || item.branch;
      const rId = item.restaurantId || item.restaurant?._id || item.restaurant;
      const bList = Array.isArray(item.branches) ? item.branches.map((b: any) => String(b._id || b)) : null;

      if (bList && bList.length > 0) {
        if (activeBranchId && !bList.includes(String(activeBranchId))) return false;
      } else if (bId && activeBranchId && String(bId) !== String(activeBranchId)) {
        return false;
      }

      if (rId && activeRestaurantId && String(rId) !== String(activeRestaurantId)) {
        return false;
      }

      return true;
    });
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (selectedCategory !== 'all') {
    const targetCat = categories.find(
      (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
    const targetId = targetCat ? targetCat.id : selectedCategory;
    const targetName = targetCat ? targetCat.name.toLowerCase() : selectedCategory.toLowerCase();

    filtered = filtered.filter((item) => {
      const itemCatId = String(item.categoryId || '');
      const itemCatName = String(item.categoryName || '').toLowerCase();
      return itemCatId === targetId || itemCatName === targetName || itemCatId.toLowerCase() === targetName;
    });
  }


  switch (sortBy) {
    case 'price-asc':
    case 'price-low':
      filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      break;
    case 'price-desc':
    case 'price-high':
      filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case 'popular':
      filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      break;
    default:
      break;
  }

  const handleCategoryFilter = (catId: string) => {
    setIsLoading(true);
    setSelectedCategory(catId);
    setTimeout(() => setIsLoading(false), 200);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const displayTableNumber = (() => {
    const raw = String(tableNumber ?? '').trim();
    if (/^\d+$/.test(raw)) {
      const num = Number.parseInt(raw, 10);
      if (num > 0 && num < 1000) return num;
    }
    return null;
  })();

  return (
    <div className="space-y-6">
      {/* Menu Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Our Menu</h1>
            {displayTableNumber && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                🪑 Table #{displayTableNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Freshly prepared dishes & beverages
          </p>
        </div>
      </div>

      {isOutletPaused && (
        <div className="rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏸️</span>
            <div>
              <h3 className="font-black text-sm text-amber-900 dark:text-amber-100">Restaurant Outlet Currently Paused</h3>
              <p className="text-xs font-semibold mt-0.5 text-amber-800 dark:text-amber-300">
                {currentRestaurant?.name || 'This outlet'} is paused and not accepting new orders. Checkout is currently disabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search delicious dishes, ingredients..."
          className="w-full rounded-2xl border border-neutral-200/90 bg-white py-3.5 pl-12 pr-10 text-sm text-neutral-900 placeholder-neutral-400 shadow-soft transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-primary-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x -mx-1 px-1">
        <button
          onClick={() => handleCategoryFilter('all')}
          className={`flex-shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold transition-all border ${
            selectedCategory === 'all'
              ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
              : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            className={`flex-shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold transition-all border ${
              selectedCategory === cat.id
                ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
                : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            {getCategoryIcon(cat.name)} {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-200"
        >
          <option value="recommended">Recommended</option>
          <option value="popular">Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        {/* Result count */}
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {filtered.length} items found
        </span>
      </div>


      {/* Menu Grid */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="mb-4 text-6xl">🍽️</span>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No items found</h3>
          <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              isFavorite={favorites.includes(item.id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

