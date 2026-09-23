import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useCartStore, useToastStore } from '@/store';
import { ROUTES } from '@/constants';
import type { MenuItem, CartItem } from '@/types';
import { FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

interface QuickOrderModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickOrderModal({ item, isOpen, onClose }: QuickOrderModalProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const setOrderSpecialInstructions = useCartStore((s) => s.setOrderSpecialInstructions);

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSpecialInstructions('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const unitPrice = item.discountPrice || item.price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (specialInstructions.trim()) {
      setOrderSpecialInstructions(specialInstructions.trim());
    }

    const cartItem: CartItem = {
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      image: item.image,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    addItem(cartItem);
    useToastStore.getState().showToast(`Added ${quantity}x ${item.name} to cart!`, 'success');
    onClose();
  };

  const handleInstantCheckout = () => {
    handleAddToCart();
    navigate(ROUTES.CUSTOMER.CHECKOUT);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-scaleUp">
        {/* Header with Food Image */}
        <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/90 hover:scale-105"
          >
            <FiX className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-md bg-primary-500/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {item.categoryName || 'Dish'}
                </span>
                <h2 className="text-xl font-black truncate mt-1">{item.name}</h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary-400">
                  ₹{unitPrice.toFixed(2)}
                </span>
                {item.discountPrice && (
                  <span className="ml-2 text-xs text-neutral-400 line-through">
                    ₹{item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {item.description && (
              <p className="text-xs text-neutral-300 line-clamp-1 mt-1">{item.description}</p>
            )}
          </div>
        </div>

        {/* Modal body */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5">
          {/* Quantity selector */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/40">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              Select Quantity
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-100 active:scale-95 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                -
              </button>
              <span className="text-2xl font-black text-neutral-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-xl font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Special Instructions / Cooking Description */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
              <span>Special Instructions / Description (e.g. Less oil, Medium spicy)</span>
              <span className="text-[10px] font-normal text-neutral-400">Optional</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, no onions, crispy, less oil..."
              value={specialInstructions}
              onChange={(e) => {
                const val = e.target.value;
                setSpecialInstructions(val);
                useCartStore.getState().setOrderSpecialInstructions(val);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            {/* Quick suggestion chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['🌶️ Extra Spicy', '🌿 Less Oil', '🧅 No Onion', '🧀 Extra Cheese', '🔥 Well Done'].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSpecialInstructions((prev) => {
                        const updated = prev ? `${prev}, ${tag.slice(3)}` : tag.slice(3);
                        useCartStore.getState().setOrderSpecialInstructions(updated);
                        return updated;
                      });
                    }}
                    className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 transition hover:bg-primary-50 hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900/80">
          <div>
            <span className="text-xs text-neutral-500">Total Amount</span>
            <p className="text-xl font-black text-primary-500">₹{totalPrice.toFixed(2)}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={handleAddToCart}>
              <FiShoppingBag className="mr-1.5 h-4 w-4" /> Add to Cart
            </Button>
            <Button variant="primary" size="md" onClick={handleInstantCheckout}>
              Order Now <FiArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
