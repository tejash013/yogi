import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Button, Card } from '@/components/ui';
import { QuantitySelector, Rating, FoodCard } from '@/components/customer';
import { ROUTES } from '@/constants';
import { useCartStore } from '@/store';
import menuData from '@/data/menu.json';
const menuItems = menuData;
const sampleReviews = [
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
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [addedToCart, setAddedToCart] = useState(false);
    const item = menuItems.find((m) => m.id === id);
    if (!item) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx("span", { className: "mb-4 text-6xl", children: "\uD83D\uDE15" }), _jsx("h2", { className: "text-xl font-bold text-neutral-900 dark:text-white", children: "Item not found" }), _jsx(Link, { to: ROUTES.CUSTOMER.MENU, className: "mt-4", children: _jsx(Button, { variant: "outline", children: "Back to Menu" }) })] }));
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
        const cartItem = {
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
    const toggleAddon = (addonId) => {
        setSelectedAddons((prev) => prev.includes(addonId)
            ? prev.filter((id) => id !== addonId)
            : [...prev, addonId]);
    };
    return (_jsxs("div", { className: "space-y-8 pb-8", children: [_jsxs(Link, { to: ROUTES.CUSTOMER.MENU, className: "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-500", children: [_jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back to Menu"] }), _jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsx("div", { className: "mb-3 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-700", children: _jsx("img", { src: allImages[selectedImage], alt: item.name, className: "h-72 w-full object-cover transition-transform duration-500 hover:scale-105 lg:h-96", onError: (e) => { e.target.style.display = 'none'; } }) }), allImages.length > 1 && (_jsx("div", { className: "flex gap-2", children: allImages.map((img, idx) => (_jsx("button", { onClick: () => setSelectedImage(idx), className: `h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${selectedImage === idx
                                        ? 'border-primary-500 ring-2 ring-primary-500/30'
                                        : 'border-neutral-200 dark:border-neutral-600'}`, children: _jsx("img", { src: img, alt: `${item.name} ${idx + 1}`, className: "h-full w-full object-cover", onError: (e) => { e.target.style.display = 'none'; } }) }, idx))) }))] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex flex-wrap gap-2", children: [_jsx(Badge, { variant: "primary", size: "sm", children: item.categoryName }), item.isPopular && _jsx(Badge, { variant: "warning", size: "sm", children: "Popular" }), item.isRecommended && _jsx(Badge, { variant: "success", size: "sm", children: "Recommended" })] }), _jsx("h1", { className: "mb-2 text-2xl font-bold text-neutral-900 dark:text-white lg:text-3xl", children: item.name }), _jsxs("div", { className: "mb-4 flex items-center gap-4", children: [_jsx(Rating, { value: item.rating, readonly: true, showValue: true, totalReviews: item.totalReviews }), _jsxs("span", { className: "flex items-center gap-1 text-sm text-neutral-500", children: [_jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), item.preparationTime, " mins"] })] }), _jsx("p", { className: "mb-6 leading-relaxed text-neutral-600 dark:text-neutral-400", children: item.description }), _jsx("div", { className: "mb-6", children: item.discountPrice ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-3xl font-bold text-primary-500", children: ["$", item.discountPrice.toFixed(2)] }), _jsxs("span", { className: "text-lg text-neutral-400 line-through", children: ["$", item.price.toFixed(2)] })] })) : (_jsxs("span", { className: "text-3xl font-bold text-primary-500", children: ["$", item.price.toFixed(2)] })) }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "mb-3 font-semibold text-neutral-900 dark:text-white", children: "Choose Size" }), _jsx("div", { className: "flex gap-2", children: variants.map((v) => (_jsxs("button", { onClick: () => setSelectedVariant(v.id), className: `flex-1 rounded-xl border-2 py-3 text-center transition-all ${selectedVariant === v.id
                                                ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                                                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300'}`, children: [_jsx("p", { className: "text-sm font-semibold", children: v.label }), _jsx("p", { className: "text-xs text-neutral-400", children: v.price === 0 ? 'Standard' : `+$${v.price.toFixed(2)}` })] }, v.id))) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "mb-3 font-semibold text-neutral-900 dark:text-white", children: "Add Extras" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: addons.map((addon) => (_jsxs("button", { onClick: () => toggleAddon(addon.id), className: `flex items-center justify-between rounded-xl border-2 px-3 py-2.5 transition-all ${selectedAddons.includes(addon.id)
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-600'}`, children: [_jsx("span", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: addon.label }), _jsxs("span", { className: "text-xs font-semibold text-primary-500", children: ["+$", addon.price.toFixed(2)] })] }, addon.id))) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "mb-2 font-semibold text-neutral-900 dark:text-white", children: "Special Instructions" }), _jsx("textarea", { value: specialInstructions, onChange: (e) => setSpecialInstructions(e.target.value), placeholder: "Any special requests? (e.g., no onions, extra spicy)", className: "w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500", rows: 3 })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(QuantitySelector, { quantity: quantity, onIncrease: () => setQuantity((q) => Math.min(q + 1, 20)), onDecrease: () => setQuantity((q) => Math.max(q - 1, 1)) }), _jsx(Button, { size: "lg", className: `flex-1 transition-all ${addedToCart ? '!bg-green-500' : ''}`, onClick: handleAddToCart, children: addedToCart ? (_jsxs(_Fragment, { children: [_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), "Added to Cart"] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "Add to Cart \u00B7 $", totalPrice.toFixed(2)] })) })] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsx("h3", { className: "mb-4 font-semibold text-neutral-900 dark:text-white", children: "Ingredients" }), _jsx("div", { className: "flex flex-wrap gap-2", children: item.ingredients.map((ing) => (_jsx(Badge, { variant: "neutral", size: "sm", children: ing }, ing))) }), _jsx("h3", { className: "mb-2 mt-4 font-semibold text-neutral-900 dark:text-white", children: "Allergens" }), _jsx("div", { className: "flex flex-wrap gap-2", children: item.allergens.length > 0 ? (item.allergens.map((a) => (_jsx(Badge, { variant: "warning", size: "sm", children: a }, a)))) : (_jsx("span", { className: "text-sm text-neutral-500", children: "None" })) })] }), _jsxs(Card, { children: [_jsx("h3", { className: "mb-4 font-semibold text-neutral-900 dark:text-white", children: "Nutritional Information" }), _jsxs("div", { className: "grid grid-cols-5 gap-2 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: item.nutritionalInfo.calories }), _jsx("p", { className: "text-xs text-neutral-500", children: "Calories" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: [item.nutritionalInfo.protein, "g"] }), _jsx("p", { className: "text-xs text-neutral-500", children: "Protein" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: [item.nutritionalInfo.carbs, "g"] }), _jsx("p", { className: "text-xs text-neutral-500", children: "Carbs" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: [item.nutritionalInfo.fat, "g"] }), _jsx("p", { className: "text-xs text-neutral-500", children: "Fat" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: [item.nutritionalInfo.fiber, "g"] }), _jsx("p", { className: "text-xs text-neutral-500", children: "Fiber" })] })] })] })] }), _jsxs("section", { children: [_jsxs("h2", { className: "mb-4 text-lg font-bold text-neutral-900 dark:text-white", children: ["Reviews (", sampleReviews.length, ")"] }), _jsx("div", { className: "space-y-4", children: sampleReviews.map((review) => (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400", children: review.userName.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-neutral-900 dark:text-white", children: review.userName }), _jsx(Rating, { value: review.rating, readonly: true, size: "sm" })] })] }), _jsx("span", { className: "text-xs text-neutral-400", children: review.date })] }), _jsx("p", { className: "mt-3 text-sm text-neutral-600 dark:text-neutral-400", children: review.comment })] }, review.id))) })] }), recommendedItems.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-lg font-bold text-neutral-900 dark:text-white", children: "You Might Also Like" }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: recommendedItems.map((recItem) => (_jsx(FoodCard, { item: recItem }, recItem.id))) })] }))] }));
}
