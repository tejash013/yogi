import { useEffect, useState } from 'react';
import { FoodCard, LoadingSkeleton } from '@/components/customer';
import { categoriesApi, menuApi } from '@/api';
import { useOrderSyncStore } from '@/store';
import type { MenuItem, Category } from '@/types';

const normalizeMenuItem = (item: any): MenuItem => ({
  id: String(item._id ?? item.id ?? ''),
  name: item.title ?? item.name,
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
  categoryId: String(item.category?._id ?? item.categoryId ?? item.category ?? ''),
  categoryName: item.categoryName ?? item.category?.name ?? 'General',
  availableQty: Number(item.availableQty ?? item.stock ?? 0),
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
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [showNonVegOnly, setShowNonVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const syncVersion = useOrderSyncStore((state) => state.version);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuRes, categoriesRes] = await Promise.all([
          menuApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const items = Array.isArray(menuRes?.data?.data) ? menuRes.data.data : Array.isArray(menuRes?.data) ? menuRes.data : [];
        const categoryList = Array.isArray(categoriesRes?.data?.data) ? categoriesRes.data.data : Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];

        setMenuItems(items.map(normalizeMenuItem));
        setCategories(categoryList.map(normalizeCategory));
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [syncVersion]);

  let filtered = [...menuItems];

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
    filtered = filtered.filter((item) => item.categoryId === selectedCategory);
  }

  if (showVegOnly) {
    filtered = filtered.filter((item) => item.tags.includes('vegetarian'));
  }

  if (showNonVegOnly) {
    filtered = filtered.filter((item) => !item.tags.includes('vegetarian'));
  }

  filtered = filtered.filter(
    (item) =>
      (item.discountPrice || item.price) >= priceRange[0] &&
      (item.discountPrice || item.price) <= priceRange[1]
  );

  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      break;
    case 'price-high':
      filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
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

  return (
    <div className="space-y-6">
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
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => handleCategoryFilter('all')}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all border ${
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
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all border ${
              selectedCategory === cat.id
                ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
                : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
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

        {/* Veg / Non-Veg Toggle */}
        <div className="flex rounded-xl border border-neutral-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-850 shadow-sm overflow-hidden p-0.5">
          <button
            onClick={() => {
              setShowVegOnly(!showVegOnly);
              if (!showVegOnly) setShowNonVegOnly(false);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              showVegOnly
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <span className="mr-1">🌱</span> Veg
          </button>
          <button
            onClick={() => {
              setShowNonVegOnly(!showNonVegOnly);
              if (!showNonVegOnly) setShowVegOnly(false);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              showNonVegOnly
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <span className="mr-1">🍗</span> Non-Veg
          </button>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-850">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Max:</span>
          <input
            type="range"
            min={0}
            max={50}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="h-1.5 w-20 accent-primary-500 cursor-pointer"
          />
          <span className="text-xs font-extrabold text-primary-500">₹{priceRange[1]}</span>
        </div>


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
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

