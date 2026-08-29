import { create } from 'zustand';
const TAX_RATE = 0.08;
const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
const calculateTotals = (items) => {
    const subtotal = calculateSubtotal(items);
    const tax = subtotal * TAX_RATE;
    return { subtotal, tax, total: subtotal + tax };
};
export const useCartStore = create((set) => ({
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    deliveryType: 'dine-in',
    tableNumber: undefined,
    deliveryAddress: undefined,
    specialInstructions: undefined,
    addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex((i) => i.menuItemId === item.menuItemId);
        let newItems;
        if (existingIndex >= 0) {
            newItems = state.items.map((i, index) => index === existingIndex
                ? { ...i, quantity: i.quantity + item.quantity }
                : i);
        }
        else {
            newItems = [...state.items, item];
        }
        const totals = calculateTotals(newItems);
        return { items: newItems, ...totals };
    }),
    removeItem: (menuItemId) => set((state) => {
        const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
        const totals = calculateTotals(newItems);
        return { items: newItems, ...totals };
    }),
    updateQuantity: (menuItemId, quantity) => set((state) => {
        if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        }
        const newItems = state.items.map((i) => i.menuItemId === menuItemId ? { ...i, quantity } : i);
        const totals = calculateTotals(newItems);
        return { items: newItems, ...totals };
    }),
    updateSpecialInstructions: (menuItemId, instructions) => set((state) => ({
        items: state.items.map((i) => i.menuItemId === menuItemId
            ? { ...i, specialInstructions: instructions }
            : i),
    })),
    setDeliveryType: (deliveryType) => set({ deliveryType }),
    setTableNumber: (tableNumber) => set({ tableNumber }),
    setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
    clearCart: () => set({
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
    recalculateTotals: () => set((state) => {
        const totals = calculateTotals(state.items);
        return { ...totals };
    }),
}));
