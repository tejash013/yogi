import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Button, Card } from '@/components/ui';
import { QuantitySelector, Rating, FoodCard } from '@/components/customer';
import { ROUTES } from '@/constants';
import { menuApi } from '@/api';
import { useCartStore } from '@/store';
import type { MenuItem, CartItem } from '@/types';

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('regular');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const [itemRes, listRes] = await Promise.all([
          menuApi.getById(String(id ?? '')).catch(() => ({ data: { data: null } })),
          menuApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        const itemData = itemRes?.data?.data ?? null;
        const list = Array.isArray(listRes?.data?.data) ? listRes.data.data : [];
        const normalizedItems = list.map(normalizeMenuItem);

        if (itemData) {
          const currentItem = normalizeMenuItem(itemData);
          setMenuItems([currentItem, ...normalizedItems.filter((entry) => entry.id !== currentItem.id)]);
          return;
        }

        setMenuItems(normalizedItems);
      } catch {
        setMenuItems([]);
      }
    };

    void loadItem();
  }, [id]);

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
  const basePrice = item.discountPrice || item.price;

  const variants = [
    { id: 'regular', label: 'Regular Portion', price: 0 },
    { id: 'medium', label: 'Medium Combo', price: Math.max(30, Math.round(basePrice * 0.35)) },
    { id: 'large', label: 'Large Feast', price: Math.max(60, Math.round(basePrice * 0.7)) },
  ];

  const addons = [
    { id: 'extra-cheese', label: 'Extra Gourmet Cheese', price: 50 },
    { id: 'signature-sauce', label: 'Signature Dip & Sauce', price: 35 },
    { id: 'crispy-onions', label: 'Crispy Fried Toppings', price: 30 },
    { id: 'beverage-add', label: 'Add Soft Drink', price: 45 },
  ];

  const variantPrice = variants.find((v) => v.id === selectedVariant)?.price || 0;
  const addonPrice = selectedAddons.reduce((sum, aId) => {
    const addon = addons.find((a) => a.id === aId);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = (basePrice + variantPrice + addonPrice) * quantity;

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      menuItemId: item.id,
      name: `${item.name} (${selectedVariant})`,
      price: totalPrice / quantity,
      quantity,
      availableQty: item.availableQty ?? 50,
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
          <div className="mb-3 overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-850">
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
                      : 'border-neutral-200 dark:border-neutral-800'
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
            <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
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
                <span className="text-3xl font-extrabold text-primary-500">
                  ₹{item.discountPrice.toFixed(2)}
                </span>
                <span className="text-lg text-neutral-400 line-through dark:text-neutral-500">₹{item.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-extrabold text-primary-500">
                ₹{item.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Variants */}
          <div className="mb-6">
            <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">Choose Size</h3>
            <div className="flex gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`flex-1 rounded-xl border-2 py-3 text-center transition-all ${
                    selectedVariant === v.id
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <p className="text-sm font-semibold">{v.label}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {v.price === 0 ? 'Standard' : `+₹${v.price.toFixed(2)}`}
                  </p>
                </button>
              ))}
            </div>
          </div>


          {/* Addons */}
          <div className="mb-6">
            <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">Add Extras</h3>
            <div className="grid grid-cols-2 gap-2">
              {addons.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center justify-between rounded-xl border-2 px-3 py-2.5 transition-all ${
                    selectedAddons.includes(addon.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-850 dark:hover:border-neutral-700'
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
            <h3 className="mb-2 font-bold text-neutral-900 dark:text-white">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (e.g., no onions, extra spicy)"
              className="w-full rounded-2xl border border-neutral-200/90 bg-white p-3.5 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-850 dark:text-white dark:placeholder-neutral-500"
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

