import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@/components/ui';
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
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-neutral-700 dark:bg-neutral-800">
      {/* Favorite Button */}
      {onFavoriteToggle && (
        <button
          onClick={() => onFavoriteToggle(item.id)}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'
            }`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}

      {/* Image */}
      <Link to={ROUTES.CUSTOMER.FOOD_DETAILS.replace(':id', item.id)}>
        <div className="relative h-44 overflow-hidden bg-neutral-100 dark:bg-neutral-700">
          {!imgError ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              🍽️
            </div>
          )}
          {item.discountPrice && (
            <div className="absolute left-3 top-3">
              <Badge variant="error" size="sm">
                -{Math.round(((item.price - item.discountPrice) / item.price) * 100)}%
              </Badge>
            </div>
          )}
          <div className="absolute bottom-2 left-2">
            <Badge variant="primary" size="sm">
              {item.preparationTime} min
            </Badge>
          </div>
        </div>
      </Link>

      {/* Content */}
      <Link to={ROUTES.CUSTOMER.FOOD_DETAILS.replace(':id', item.id)}>
        <div className="p-4">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1">
              {item.name}
            </h3>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {item.rating}
              </span>
              <span className="text-xs text-neutral-400">({item.totalReviews})</span>
            </div>
          </div>

          <p className="mb-3 text-sm text-neutral-500 line-clamp-1">{item.description}</p>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Price & Add to Cart */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-700">
        <div>
          {item.discountPrice ? (
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-primary-500">
                ${item.discountPrice.toFixed(2)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                ${item.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary-500">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleAddToCart}
          className={added ? '!bg-green-500' : ''}
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

