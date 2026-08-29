import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FoodCard, CategoryCard, OfferBanner } from '@/components/customer';
import { ROUTES } from '@/constants';
import { categoriesApi, menuApi, offersApi } from '@/api';
import type { MenuItem, Category, Offer } from '@/types';

const normalizeMenuItem = (item: any): MenuItem => ({
  id: item._id ?? item.id,
  name: item.title ?? item.name,
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
  categoryId: item.category ?? item.categoryId ?? '',
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
  id: item._id ?? item.id,
  name: item.name ?? 'Category',
  description: item.description ?? '',
  image: item.image ?? '/images/category.jpg',
  icon: item.icon ?? '🍽️',
  isActive: item.isActive ?? true,
  sortOrder: item.sortOrder ?? 0,
  itemCount: item.itemCount ?? 0,
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const normalizeOffer = (item: any): Offer => ({
  id: item._id ?? item.id,
  title: item.title ?? item.name ?? 'Offer',
  description: item.description ?? '',
  image: item.image ?? '/images/offer.jpg',
  discountType: item.discountType ?? 'percentage',
  discountValue: Number(item.discountValue ?? 0),
  validUntil: item.validUntil ?? new Date().toISOString(),
  terms: item.terms ?? [],
  isActive: item.isActive ?? true,
});

export default function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const offerScrollRef = useRef<HTMLDivElement>(null);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuRes, categoriesRes, offersRes] = await Promise.all([
          menuApi.getPopular().catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
          offersApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const items = Array.isArray(menuRes?.data?.data) ? menuRes.data.data : [];
        const categoryList = Array.isArray(categoriesRes?.data?.data) ? categoriesRes.data.data : [];
        const offerList = Array.isArray(offersRes?.data?.data) ? offersRes.data.data : [];

        setMenuItems(items.map(normalizeMenuItem));
        setCategories(categoryList.map(normalizeCategory));
        setOffers(offerList.map(normalizeOffer));
      } catch {
        setMenuItems([]);
        setCategories([]);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const popularItems = menuItems.filter((item) => item.isPopular);
  const recommendedItems = menuItems.filter((item) => item.isRecommended);
  const bestSellers = [...menuItems].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const newArrivals = [...menuItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory)
    : [];

  const displayOffers = offers.length > 0 ? [...offers, offers[0]] : [];

  useEffect(() => {
    if (!offerScrollRef.current || offers.length === 0) {
      return;
    }

    let resetTimeout: number | undefined;

    const slideNext = () => {
      setActiveOfferIndex((prevIndex) => {
        const container = offerScrollRef.current;
        const isOnClone = prevIndex === displayOffers.length - 1;

        if (isOnClone) {
          if (container) {
            container.scrollLeft = 0;
          }
          return 0;
        }

        const nextIndex = prevIndex + 1;
        const offerCard = container?.children[nextIndex] as HTMLElement | undefined;

        if (offerCard && container) {
          const offsetLeft = offerCard.offsetLeft;
          const offsetWidth = offerCard.offsetWidth;
          const containerWidth = container.clientWidth;
          const targetScrollLeft = offsetLeft - (containerWidth - offsetWidth) / 2;

          container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        }

        if (nextIndex === displayOffers.length - 1) {
          resetTimeout = window.setTimeout(() => {
            if (offerScrollRef.current) {
              offerScrollRef.current.scrollLeft = 0;
              setActiveOfferIndex(0);
            }
          }, 500);
        }

        return nextIndex;
      });
    };

    const interval = window.setInterval(slideNext, 2000);

    return () => {
      window.clearInterval(interval);
      if (resetTimeout) {
        window.clearTimeout(resetTimeout);
      }
    };
  }, [displayOffers.length, offers.length]);

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
      {!loading && offers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Today's Offers</h2>
            <span className="text-xs font-medium text-primary-500">View All</span>
          </div>
          <div
            ref={offerScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          >
            {displayOffers.map((offer, index) => (
              <div
                key={`${offer.id}-${index}`}
                className={`min-w-[280px] flex-shrink-0 transition-transform duration-500 ${
                  index === activeOfferIndex ? 'scale-100' : 'scale-95 opacity-80'
                }`}
              >
                <OfferBanner offer={offer} />
              </div>
            ))}
          </div>
        </section>
      )}

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

