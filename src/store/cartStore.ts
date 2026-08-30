import { create } from 'zustand';
import { useToastStore } from '@/store/toastStore';
import type { CartItem, Cart } from '@/types';

interface CartState extends Cart {
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateSpecialInstructions: (menuItemId: string, instructions: string) => void;
  setDeliveryType: (type: Cart['deliveryType']) => void;
  setTableNumber: (tableNumber: number | undefined) => void;
  setDeliveryAddress: (address: string | undefined) => void;
  clearCart: () => void;
  recalculateTotals: () => void;
}

const TAX_RATE = 0.08;

const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const calculateTotals = (items: CartItem[]) => {
  const subtotal = calculateSubtotal(items);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  deliveryType: 'dine-in',
  tableNumber: undefined,
  deliveryAddress: undefined,
  specialInstructions: undefined,

  addItem: (item: CartItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.menuItemId === item.menuItemId);
      const maxAvailable = item.availableQty ?? Number.MAX_SAFE_INTEGER;
      const nextQuantity = (existingItem?.quantity ?? 0) + item.quantity;

      if (nextQuantity > maxAvailable) {
        useToastStore.getState().showToast(`Only ${maxAvailable} left in stock for ${item.name}.`, 'error');
        return state;
      }

      const existingIndex = state.items.findIndex(
        (i) => i.menuItemId === item.menuItemId
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((i, index) =>
          index === existingIndex
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, item];
      }

      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }),

  removeItem: (menuItemId: string) =>
    set((state) => {
      const newItems = state.items.filter(
        (i) => i.menuItemId !== menuItemId
      );
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }),

  updateQuantity: (menuItemId: string, quantity: number) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.menuItemId === menuItemId);
      const maxAvailable = existingItem?.availableQty ?? Number.MAX_SAFE_INTEGER;

      if (quantity <= 0) {
        const newItems = state.items.filter(
          (i) => i.menuItemId !== menuItemId
        );
        const totals = calculateTotals(newItems);
        return { items: newItems, ...totals };
      }

      if (quantity > maxAvailable) {
        useToastStore.getState().showToast(`Only ${maxAvailable} left in stock for ${existingItem?.name ?? 'this item'}.`, 'error');
        return state;
      }

      const newItems = state.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      );
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }),

  updateSpecialInstructions: (menuItemId: string, instructions: string) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItemId === menuItemId
          ? { ...i, specialInstructions: instructions }
          : i
      ),
    })),

  setDeliveryType: (deliveryType: Cart['deliveryType']) =>
    set({ deliveryType }),

  setTableNumber: (tableNumber: number | undefined) =>
    set({ tableNumber }),

  setDeliveryAddress: (deliveryAddress: string | undefined) =>
    set({ deliveryAddress }),

  clearCart: () =>
    set({
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      deliveryType: 'dine-in',
      tableNumber: undefined,
      deliveryAddress: undefined,
      specialInstructions: undefined,
    }),

  recalculateTotals: () =>
    set((state) => {
      const totals = calculateTotals(state.items);
      return { ...totals };
    }),
}));

