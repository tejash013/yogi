import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useCartStore } from '@/store';
import type { MenuItem, CartItem } from '@/types';

interface FoodCardProps {
  item: MenuItem;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
}

export default function FoodCard({ item, onFavoriteToggle, isFavorite }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.discountPrice || item.price,
      quantity: 1,
      image: item.image,
    };
    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-850/95 dark:hover:border-primary-500/40 dark:hover:shadow-glow">
      {/* Favorite Button */}
      {onFavoriteToggle && (
        <button
          onClick={() => onFavoriteToggle(item.id)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 dark:bg-neutral-900/80 dark:hover:bg-neutral-800"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 dark:text-neutral-500'
            }`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}

      {/* Image Container */}
      <Link to={ROUTES.CUSTOMER.FOOD_DETAILS.replace(':id', item.id)} className="block">
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
          {!imgError ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400 dark:text-neutral-500">
              <span className="text-4xl">🍽️</span>
              <span className="text-[11px] font-medium tracking-wide uppercase">{item.categoryName || 'Dish'}</span>
            </div>
          )}


          {/* Discount Badge */}
          {item.discountPrice && (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center rounded-lg bg-red-500/90 px-2 py-0.5 text-xs font-bold text-white shadow-sm backdrop-blur">
                -{Math.round(((item.price - item.discountPrice) / item.price) * 100)}%
              </span>
            </div>
          )}

          {/* Prep Time Badge */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur border border-white/10">
              <svg className="h-3 w-3 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.preparationTime} min
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <Link to={ROUTES.CUSTOMER.FOOD_DETAILS.replace(':id', item.id)} className="flex-1 p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="font-bold text-neutral-900 transition-colors group-hover:text-primary-500 dark:text-neutral-100 line-clamp-1">
            {item.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {item.rating}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              ({item.totalReviews})
            </span>
          </div>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:border dark:border-neutral-700/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Footer Price & Add to Cart */}
      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
        <div>
          {item.discountPrice ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-primary-500">
                ${item.discountPrice.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-neutral-400 line-through dark:text-neutral-500">
                ${item.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-black text-primary-500">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleAddToCart}
          className={added ? '!bg-green-500 text-white' : 'shadow-sm hover:shadow-md'}
        >
          {added ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {added ? 'Added' : 'Add'}
        </Button>
      </div>
    </div>
  );
}


