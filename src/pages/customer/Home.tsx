import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FoodCard, CategoryCard, OfferBanner } from '@/components/customer';
import { TenantSelector } from '@/components/common';
import { ROUTES } from '@/constants';
import { categoriesApi, menuApi, offersApi } from '@/api';
import { useOrderSyncStore, useTenantStore } from '@/store';
import type { MenuItem, Category, Offer } from '@/types';

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const offerScrollRef = useRef<HTMLDivElement>(null);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

  // Top-level Tenant & Location Hooks
  const branchId = useTenantStore((s) => s.branchId);
  const availableBranches = useTenantStore((s) => s.availableBranches);
  const userLocation = useTenantStore((s) => s.userLocation);
  const isLocating = useTenantStore((s) => s.isLocating);
  const requestUserLocation = useTenantStore((s) => s.requestUserLocation);
  const setModalOpen = useTenantStore((s) => s.setModalOpen);
  const switchBranch = useTenantStore((s) => s.switchBranch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.CUSTOMER.MENU}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const syncVersion = useOrderSyncStore((state) => state.version);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuRes, categoriesRes, offersRes] = await Promise.all([
          menuApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
          offersApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const rawMenu = Array.isArray(menuRes?.data?.data) ? menuRes.data.data : Array.isArray(menuRes?.data) ? menuRes.data : [];
        const categoryList = Array.isArray(categoriesRes?.data?.data) ? categoriesRes.data.data : Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];
        const offerList = Array.isArray(offersRes?.data?.data) ? offersRes.data.data : Array.isArray(offersRes?.data) ? offersRes.data : [];

        setMenuItems(rawMenu.map(normalizeMenuItem));
        setCategories(categoryList.map(normalizeCategory));
        setOffers(offerList.map(normalizeOffer));
      } catch {
        setMenuItems([]);
        setCategories([]);
        setOffers([]);
      }
    };


    void loadData();
  }, [syncVersion]);

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
      {/* SaaS Location & Branch Context Banner */}
      <TenantSelector variant="banner" showDetails={true} />

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for dishes, cuisines, drinks... (Press Enter to search)"
          className="w-full rounded-2xl border border-neutral-200/90 bg-white py-3.5 pl-12 pr-4 text-sm text-neutral-900 placeholder-neutral-400 shadow-soft transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-primary-400"
        />
      </form>

      {/* Dine-In Visual Floor Plan Quick Action Banner */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#524133]/60 bg-gradient-to-r from-[#211a16] via-[#1a1411] to-[#261c16] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e0caa7]">
                Live Restaurant Seating
              </span>
            </div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Choose Your Dining Table 🍽️
            </h3>
            <p className="max-w-md text-xs text-[#cfc1b0]">
              View our ambient dining hall in real-time, pick Table 1 - 6, and receive instant tableside service.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.CUSTOMER.TABLES}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-xs font-black text-neutral-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-300 hover:to-amber-400 hover:scale-[1.02]"
            >
              <span>🖼️ Open Visual Floor Map</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Nearby Restaurants & Branches Proximity Section */}
      <section className="rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50/80 p-5 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                GPS Location Powered
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              Nearby Branches & Outlets 📍
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select your nearest branch for fastest table seating & hot delivery
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void requestUserLocation()}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {isLocating ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <span>Detecting GPS...</span>
                </>
              ) : userLocation ? (
                <>
                  <span>🎯 GPS Active</span>
                  <span className="text-[10px] opacity-75">(Refresh)</span>
                </>
              ) : (
                <>
                  <span>🎯 Use My Location</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              View All Locations
            </button>
          </div>
        </div>

        {/* Branch Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableBranches.slice(0, 3).map((br, index) => {
            const isSelected = br._id === branchId;
            const isClosest = index === 0 && userLocation && br.distanceKm !== undefined;
            return (
              <div
                key={br._id}
                onClick={() => switchBranch(br._id)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-500/60 dark:bg-emerald-950/20'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-850 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{br.name}</h4>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      📍 {br.address || 'Dining Hall & Takeaway Counter'}
                    </p>
                  </div>
                  {isSelected ? (
                    <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Active
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300">
                      Select
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-1.5">
                    {br.distanceKm !== undefined ? (
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        📍 {br.distanceKm < 1 ? `${Math.round(br.distanceKm * 1000)}m` : `${br.distanceKm.toFixed(1)} km`}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">City Center Area</span>
                    )}
                    {isClosest && (
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        ⭐ Nearest
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                    {isSelected ? 'Currently Browsing' : 'Switch Branch →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Offers Banner */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Today's Specials & Offers</h2>
          <Link to={ROUTES.CUSTOMER.COUPONS} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            View All
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
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


      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Explore Categories</h2>
          <div className="flex gap-1.5">
            <button
              onClick={() => scrollCategory('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Scroll left"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollCategory('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Scroll right"
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
          <h2 className="mb-4 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
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
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Popular Foods</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            View All
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Recommended For You</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            View All
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Best Sellers</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            View All
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">New Arrivals</h2>
          <Link to={ROUTES.CUSTOMER.MENU} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            View All
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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

