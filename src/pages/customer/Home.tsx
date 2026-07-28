import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { FoodCard, CategoryCard, OfferBanner } from '@/components/customer';
import { ROUTES } from '@/constants';
import type { MenuItem, Category, Offer } from '@/types';
import menuData from '@/data/menu.json';
import categoriesData from '@/data/categories.json';
import offersData from '@/data/offers.json';

const menuItems = menuData as MenuItem[];
const categories = categoriesData as Category[];
const offers = offersData as Offer[];

export default function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const popularItems = menuItems.filter((item) => item.isPopular);
  const recommendedItems = menuItems.filter((item) => item.isRecommended);
  const bestSellers = [...menuItems].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const newArrivals = [...menuItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory)
    : [];

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for dishes, categories..."
          className="w-full rounded-2xl border border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm text-neutral-900 placeholder-neutral-400 shadow-soft transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
        />
      </div>

      {/* Offers Banner */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Today's Offers</h2>
          <span className="text-xs font-medium text-primary-500">View All</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {offers.map((offer) => (
            <div key={offer.id} className="min-w-[280px] flex-shrink-0">
              <OfferBanner offer={offer} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Categories</h2>
          <div className="flex gap-1">
            <button
              onClick={() => scrollCategory('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollCategory('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={categoryScrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isActive={selectedCategory === cat.id}
              onClick={(id) => setSelectedCategory(selectedCategory === id ? null : id)}
            />
          ))}
        </div>
      </section>

      {/* Filtered Items by Category */}
      {selectedCategory && filteredItems.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
            {categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Foods */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Popular Foods</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View All
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Recommended Foods */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recommended For You</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View All
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recommendedItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Best Sellers</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View All
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bestSellers.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">New Arrivals</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View All
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {newArrivals.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

