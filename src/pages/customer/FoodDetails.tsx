import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Button, Card } from '@/components/ui';
import { QuantitySelector, Rating, FoodCard } from '@/components/customer';
import { ROUTES } from '@/constants';
import { useCartStore } from '@/store';
import type { MenuItem, CartItem } from '@/types';
import menuData from '@/data/menu.json';

const menuItems = menuData as MenuItem[];

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const sampleReviews: Review[] = [
  { id: 'r1', userName: 'Sarah M.', rating: 5, comment: 'Absolutely delicious! The flavors were perfectly balanced.', date: '2025-03-15' },
  { id: 'r2', userName: 'John D.', rating: 4, comment: 'Great dish, very fresh ingredients. Will order again.', date: '2025-03-12' },
  { id: 'r3', userName: 'Emily R.', rating: 5, comment: 'One of the best I\'ve had. Highly recommended!', date: '2025-03-10' },
];

export default function FoodDetails() {
  const { id } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('regular');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  const item = menuItems.find((m) => m.id === id);
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="mb-4 text-6xl">😕</span>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Item not found</h2>
        <Link to={ROUTES.CUSTOMER.MENU} className="mt-4">
          <Button variant="outline">Back to Menu</Button>
        </Link>
      </div>
    );
  }

  const allImages = item.images.length > 0 ? item.images : [item.image];
  const recommendedItems = menuItems.filter((m) => m.id !== item.id && m.categoryId === item.categoryId).slice(0, 4);

  const variants = [
    { id: 'regular', label: 'Regular', price: 0 },
    { id: 'large', label: 'Large', price: 3 },
    { id: 'xl', label: 'Extra Large', price: 5 },
  ];

  const addons = [
    { id: 'extra-cheese', label: 'Extra Cheese', price: 1.99 },
    { id: 'bacon', label: 'Bacon', price: 2.49 },
    { id: 'avocado', label: 'Avocado', price: 1.49 },
    { id: 'mushrooms', label: 'Mushrooms', price: 0.99 },
  ];

  const variantPrice = variants.find((v) => v.id === selectedVariant)?.price || 0;
  const addonPrice = selectedAddons.reduce((sum, aId) => {
    const addon = addons.find((a) => a.id === aId);
    return sum + (addon?.price || 0);
  }, 0);
  const basePrice = item.discountPrice || item.price;
  const totalPrice = (basePrice + variantPrice + addonPrice) * quantity;

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      menuItemId: item.id,
      name: `${item.name} (${selectedVariant})`,
      price: totalPrice / quantity,
      quantity,
      image: item.image,
      specialInstructions,
    };
    addItem(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Back Button */}
      <Link
        to={ROUTES.CUSTOMER.MENU}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-500"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Menu
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="mb-3 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-700">
            <img
              src={allImages[selectedImage]}
              alt={item.name}
              className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105 lg:h-96"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-neutral-200 dark:border-neutral-600'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${item.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="primary" size="sm">{item.categoryName}</Badge>
            {item.isPopular && <Badge variant="warning" size="sm">Popular</Badge>}
            {item.isRecommended && <Badge variant="success" size="sm">Recommended</Badge>}
          </div>

          <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white lg:text-3xl">
            {item.name}
          </h1>

          <div className="mb-4 flex items-center gap-4">
            <Rating value={item.rating} readonly showValue totalReviews={item.totalReviews} />
            <span className="flex items-center gap-1 text-sm text-neutral-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.preparationTime} mins
            </span>
          </div>

          <p className="mb-6 leading-relaxed text-neutral-600 dark:text-neutral-400">
            {item.description}
          </p>

          {/* Pricing */}
          <div className="mb-6">
            {item.discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary-500">
                  ₹{item.discountPrice.toFixed(2)}
                </span>
                <span className="text-lg text-neutral-400 line-through">₹{item.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary-500">
                ₹{item.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Variants */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Choose Size</h3>
            <div className="flex gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`flex-1 rounded-xl border-2 py-3 text-center transition-all ${
                    selectedVariant === v.id
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <p className="text-sm font-semibold">{v.label}</p>
                  <p className="text-xs text-neutral-400">
                    {v.price === 0 ? 'Standard' : `+₹${v.price.toFixed(2)}`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Addons */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Add Extras</h3>
            <div className="grid grid-cols-2 gap-2">
              {addons.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center justify-between rounded-xl border-2 px-3 py-2.5 transition-all ${
                    selectedAddons.includes(addon.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {addon.label}
                  </span>
                  <span className="text-xs font-semibold text-primary-500">+₹{addon.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (e.g., no onions, extra spicy)"
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
              rows={3}
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => Math.min(q + 1, 20))}
              onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
            />
            <Button
              size="lg"
              className={`flex-1 transition-all ${addedToCart ? '!bg-green-500' : ''}`}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Cart · ₹{totalPrice.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Nutritional Info & Ingredients */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {item.ingredients.map((ing) => (
              <Badge key={ing} variant="neutral" size="sm">{ing}</Badge>
            ))}
          </div>
          <h3 className="mb-2 mt-4 font-semibold text-neutral-900 dark:text-white">Allergens</h3>
          <div className="flex flex-wrap gap-2">
            {item.allergens.length > 0 ? (
              item.allergens.map((a) => (
                <Badge key={a} variant="warning" size="sm">{a}</Badge>
              ))
            ) : (
              <span className="text-sm text-neutral-500">None</span>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Nutritional Information</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{item.nutritionalInfo.calories}</p>
              <p className="text-xs text-neutral-500">Calories</p>
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{item.nutritionalInfo.protein}g</p>
              <p className="text-xs text-neutral-500">Protein</p>
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{item.nutritionalInfo.carbs}g</p>
              <p className="text-xs text-neutral-500">Carbs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{item.nutritionalInfo.fat}g</p>
              <p className="text-xs text-neutral-500">Fat</p>
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{item.nutritionalInfo.fiber}g</p>
              <p className="text-xs text-neutral-500">Fiber</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reviews */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
          Reviews ({sampleReviews.length})
        </h2>
        <div className="space-y-4">
          {sampleReviews.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{review.userName}</p>
                    <Rating value={review.rating} readonly size="sm" />
                  </div>
                </div>
                <span className="text-xs text-neutral-400">{review.date}</span>
              </div>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{review.comment}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Recommended Items */}
      {recommendedItems.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">You Might Also Like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedItems.map((recItem) => (
              <FoodCard key={recItem.id} item={recItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

