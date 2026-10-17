import { useEffect, useMemo, useRef, useState } from 'react';
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
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('shake') || lower.includes('juice') || lower.includes('mocktail')) return '🥤';
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('chai')) return '☕';
  if (lower.includes('extra') || lower.includes('side') || lower.includes('snack') || lower.includes('starter') || lower.includes('appetizer')) return '🍿';
  if (lower.includes('dessert') || lower.includes('ice cream') || lower.includes('sweet') || lower.includes('cake') || lower.includes('pastry')) return '🍦';
  if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('chinese') || lower.includes('chowmein')) return '🍜';
  if (lower.includes('main') || lower.includes('thali') || lower.includes('dish') || lower.includes('curry') || lower.includes('gravy')) return '🍛';
  if (lower.includes('biryani') || lower.includes('rice') || lower.includes('pulao')) return '🍚';
  if (lower.includes('roti') || lower.includes('bread') || lower.includes('naan') || lower.includes('paratha')) return '🫓';
  if (lower.includes('salad') || lower.includes('healthy')) return '🥗';
  if (lower.includes('soup')) return '🍲';
  if (lower.includes('sandwich') || lower.includes('wrap') || lower.includes('roll')) return '🥪';
  return '🍽️';
}

const normalizeMenuItem = (item: any): MenuItem & { branchId?: string; restaurantId?: string; branches?: string[] } => ({
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
  branchId: item.branchId ? String(item.branchId) : item.branch?._id ? String(item.branch._id) : item.branch ? String(item.branch) : undefined,
  restaurantId: item.restaurantId ? String(item.restaurantId) : item.restaurant?._id ? String(item.restaurant._id) : item.restaurant ? String(item.restaurant) : undefined,
  branches: Array.isArray(item.branches) ? item.branches.map((b: any) => String(b._id || b)) : undefined,
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
  const setTenant = useTenantStore((s) => s.setTenant);
  const setTableContext = useCartStore((s) => s.setTableContext);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const [searchParams] = useSearchParams();

  const qBranchId = searchParams.get('branchId') || searchParams.get('branch') || undefined;
  const qRestId = searchParams.get('restaurantId') || searchParams.get('restaurant') || undefined;
  const qTable = searchParams.get('table') || searchParams.get('tableId') || undefined;

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

  const qrInitializedRef = useRef(false);
  useEffect(() => {
    // If arriving with explicit QR code params, sync tenant and table state once on entry
    if (!qrInitializedRef.current && qBranchId) {
      qrInitializedRef.current = true;
      void setTenant(qRestId || currentRestaurant?._id || '', qBranchId);
    }
    if (qTable) {
      const parsed = Number.parseInt(String(qTable).replace(/\D/g, ''), 10);
      setTableContext({ tableId: qTable, tableNumber: Number.isFinite(parsed) ? parsed : undefined });
    }
  }, [qBranchId, qRestId, qTable, setTenant, setTableContext]);

  const activeBranchId = branchId || currentBranch?._id || qBranchId || localStorage.getItem('restaurantos-branch-id');
  const activeRestaurantId = currentRestaurant?._id || qRestId || localStorage.getItem('restaurantos-restaurant-id');
  const isOutletPaused = currentRestaurant?.isActive === false || currentBranch?.isActive === false;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (isOutletPaused) {
          setMenuItems([]);
          setCategories([]);
          return;
        }

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
  }, [syncVersion, branchId, activeBranchId, activeRestaurantId, isOutletPaused]);

  let filtered = isOutletPaused ? [] : [...menuItems];

  // Strictly filter menu by current active branch & restaurant
  if (!isOutletPaused && (activeBranchId || activeRestaurantId)) {
    const scopedItems = filtered.filter((item: any) => {
      const bId = item.branchId || item.branch?._id || item.branch;
      const rId = item.restaurantId || item.restaurant?._id || item.restaurant;
      const bList = Array.isArray(item.branches) ? item.branches.map((b: any) => String(b._id || b)) : null;

      let matchesBranch = true;
      if (bList && bList.length > 0) {
        matchesBranch = activeBranchId ? bList.includes(String(activeBranchId)) : true;
      } else if (bId && activeBranchId) {
        matchesBranch = String(bId) === String(activeBranchId);
      }

      let matchesRestaurant = true;
      if (rId && activeRestaurantId) {
        matchesRestaurant = String(rId) === String(activeRestaurantId);
      }

      return matchesBranch && matchesRestaurant;
    });

    filtered = scopedItems;
  }

  // Filter categories strictly to active items or current restaurant
  const activeCategoryIds = new Set(filtered.map((item) => String(item.categoryId)));
  const visibleCategories = categories.filter((cat) => {
    if (activeCategoryIds.has(String(cat.id))) return true;
    const cRestId = (cat as any).restaurantId;
    const cBranchId = (cat as any).branchId;
    if (cRestId && activeRestaurantId && String(cRestId) !== String(activeRestaurantId)) return false;
    if (cBranchId && activeBranchId && String(cBranchId) !== String(activeBranchId)) return false;
    return activeCategoryIds.has(String(cat.id)) || (!cRestId && !cBranchId);
  });

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

  // Group filtered items by category with category mentioned first
  const categoryGroups = useMemo(() => {
    if (filtered.length === 0) return [];

    const groups: Array<{
      id: string;
      name: string;
      icon: string;
      description?: string;
      items: MenuItem[];
    }> = [];

    const matchedItemIds = new Set<string>();

    // 1. Group items under visibleCategories in configured order
    for (const cat of visibleCategories) {
      const catId = String(cat.id || '').trim();
      const catName = String(cat.name || '').trim().toLowerCase();

      const itemsForCat = filtered.filter((item) => {
        const itemCatId = String(item.categoryId || '').trim();
        const itemCatName = String(item.categoryName || '').trim().toLowerCase();

        return (
          (catId && itemCatId === catId) ||
          (catName && itemCatName === catName) ||
          (catId && itemCatId.toLowerCase() === catName)
        );
      });

      if (itemsForCat.length > 0) {
        itemsForCat.forEach((it) => matchedItemIds.add(it.id));
        groups.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || getCategoryIcon(cat.name),
          description: cat.description,
          items: itemsForCat,
        });
      }
    }

    // 2. Any items that did not match a known category
    const unmatchedItems = filtered.filter((item) => !matchedItemIds.has(item.id));
    if (unmatchedItems.length > 0) {
      const unmatchedMap = new Map<string, MenuItem[]>();
      for (const item of unmatchedItems) {
        const cName = (item.categoryName || 'Chef Specials').trim();
        if (!unmatchedMap.has(cName)) {
          unmatchedMap.set(cName, []);
        }
        unmatchedMap.get(cName)!.push(item);
      }

      unmatchedMap.forEach((uItems, uName) => {
        groups.push({
          id: `cat-${uName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: uName,
          icon: getCategoryIcon(uName),
          description: undefined,
          items: uItems,
        });
      });
    }

    return groups;
  }, [filtered, visibleCategories]);

  const handleCategoryFilter = (catId: string) => {
    if (catId === 'all') {
      setSelectedCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If viewing all categories, scroll directly to that category section
    if (selectedCategory === 'all') {
      const el = document.getElementById(`category-section-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    setIsLoading(true);
    setSelectedCategory(catId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleFilterSingleCategory = (catId: string) => {
    setIsLoading(true);
    setSelectedCategory(catId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            Freshly prepared dishes & beverages organized by category
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <span>📍</span>
            <span>{currentRestaurant?.name || 'Restaurant'}</span>
            <span className="text-neutral-400">·</span>
            <span className="text-primary-600 dark:text-primary-400">{currentBranch?.name || 'Main Hall'}</span>
          </div>
        </div>
      </div>

      {isOutletPaused && (
        <div className="rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏸️</span>
            <div>
              <h3 className="font-black text-sm text-amber-900 dark:text-amber-100">Restaurant Outlet Currently Paused</h3>
              <p className="text-xs font-semibold mt-0.5 text-amber-800 dark:text-amber-300">
                {currentRestaurant?.name || 'This outlet'} ({currentBranch?.name || 'Main'}) is currently paused or restricted. Checkout and new orders are disabled.
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

      {/* Categories Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x -mx-1 px-1">
        <button
          onClick={() => handleCategoryFilter('all')}
          className={`flex-shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold transition-all border flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
              : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          <span>🍽️</span>
          <span>All Items</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
            {menuItems.length}
          </span>
        </button>
        {visibleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={`flex-shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
                  : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{cat.icon || getCategoryIcon(cat.name)}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Single Category Focus Banner */}
      {selectedCategory !== 'all' && (
        <div className="flex items-center justify-between rounded-2xl border border-primary-200/70 bg-primary-50/70 p-3.5 text-xs text-primary-900 dark:border-primary-800/60 dark:bg-primary-950/30 dark:text-primary-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">📂</span>
            <span>
              Showing dishes for category:{' '}
              <span className="font-bold underline decoration-primary-400 underline-offset-2">
                {categories.find((c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCategoryFilter('all')}
            className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 font-bold text-primary-700 shadow-xs hover:bg-primary-100 dark:bg-neutral-800 dark:text-primary-300 dark:hover:bg-neutral-700 transition"
          >
            <span>View All Categories</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Sort by:
          </label>
          <select
            id="sort-by"
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
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'} found</span>
          <span>·</span>
          <span>{categoryGroups.length} {categoryGroups.length === 1 ? 'category' : 'categories'}</span>
        </div>
      </div>

      {/* Menu Categories & Items Display */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="mb-4 text-6xl">🍽️</span>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No items found</h3>
          <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters or search term</p>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => handleCategoryFilter('all')}
              className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-600 transition"
            >
              View All Categories
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {categoryGroups.map((group) => (
            <section
              key={group.id}
              id={`category-section-${group.id}`}
              className="scroll-mt-28 space-y-5"
            >
              {/* Category Header - Category mentioned first */}
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-r from-neutral-50 via-white to-amber-50/30 p-4 shadow-xs dark:border-neutral-800 dark:from-neutral-850 dark:via-neutral-850 dark:to-neutral-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 text-2xl shadow-inner dark:bg-primary-500/20">
                      <span>{group.icon}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                          {group.name}
                        </h2>
                        <span className="rounded-full bg-primary-500/15 border border-primary-500/30 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:text-primary-300">
                          {group.items.length} {group.items.length === 1 ? 'dish' : 'dishes'}
                        </span>
                      </div>
                      {group.description && (
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Action */}
                  <div className="flex items-center gap-2 self-start sm:self-auto pt-1 sm:pt-0">
                    {selectedCategory === 'all' ? (
                      <button
                        type="button"
                        onClick={() => handleFilterSingleCategory(group.id)}
                        className="flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-2xs transition hover:border-primary-400 hover:text-primary-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-primary-500 dark:hover:text-primary-400"
                        title={`Filter only ${group.name}`}
                      >
                        <span>Only {group.name}</span>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCategoryFilter('all')}
                        className="flex items-center gap-1.5 rounded-xl border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-2xs transition hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>View All Categories</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Decorative accent gradient divider */}
                <div className="mt-3.5 h-0.5 w-full rounded-full bg-gradient-to-r from-primary-500 via-primary-300/40 to-transparent dark:from-primary-400 dark:via-primary-700/30 dark:to-transparent" />
              </div>

              {/* Items grid for this category */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    isFavorite={favorites.includes(item.id)}
                    onFavoriteToggle={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

