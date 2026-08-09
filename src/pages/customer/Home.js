import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { FoodCard, CategoryCard, OfferBanner } from '@/components/customer';
import { ROUTES } from '@/constants';
import menuData from '@/data/menu.json';
import categoriesData from '@/data/categories.json';
import offersData from '@/data/offers.json';
const menuItems = menuData;
const categories = categoriesData;
const offers = offersData;
export default function CustomerHome() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const categoryScrollRef = useRef(null);
    const offerScrollRef = useRef(null);
    const [activeOfferIndex, setActiveOfferIndex] = useState(0);
    const popularItems = menuItems.filter((item) => item.isPopular);
    const recommendedItems = menuItems.filter((item) => item.isRecommended);
    const bestSellers = [...menuItems].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const newArrivals = [...menuItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
    const filteredItems = selectedCategory
        ? menuItems.filter((item) => item.categoryId === selectedCategory)
        : [];
    const displayOffers = offers.length > 0 ? [...offers, offers[0]] : [];
    useEffect(() => {
        if (!offerScrollRef.current || offers.length === 0) {
            return;
        }
        let resetTimeout;
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
                const offerCard = container?.children[nextIndex];
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
    const scrollCategory = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = 200;
            categoryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search for dishes, categories...", className: "w-full rounded-2xl border border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm text-neutral-900 placeholder-neutral-400 shadow-soft transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500" })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: "Today's Offers" }), _jsx("span", { className: "text-xs font-medium text-primary-500", children: "View All" })] }), _jsx("div", { ref: offerScrollRef, className: "flex gap-4 overflow-x-auto pb-2 scrollbar-hide", children: displayOffers.map((offer, index) => (_jsx("div", { className: `min-w-[280px] flex-shrink-0 transition-transform duration-500 ${index === activeOfferIndex ? 'scale-100' : 'scale-95 opacity-80'}`, children: _jsx(OfferBanner, { offer: offer }) }, `${offer.id}-${index}`))) })] }), _jsxs("section", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: "Categories" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => scrollCategory('left'), className: "flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300", children: _jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { onClick: () => scrollCategory('right'), className: "flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300", children: _jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] })] }), _jsx("div", { ref: categoryScrollRef, className: "flex gap-3 overflow-x-auto pb-2 scrollbar-hide", children: categories.map((cat) => (_jsx(CategoryCard, { category: cat, isActive: selectedCategory === cat.id, onClick: (id) => setSelectedCategory(selectedCategory === id ? null : id) }, cat.id))) })] }), selectedCategory && filteredItems.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-lg font-bold text-neutral-900 dark:text-white", children: categories.find((c) => c.id === selectedCategory)?.name }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filteredItems.map((item) => (_jsx(FoodCard, { item: item }, item.id))) })] })), _jsxs("section", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: "Popular Foods" }), _jsx(Link, { to: ROUTES.CUSTOMER.MENU, className: "text-sm font-medium text-primary-500 hover:text-primary-600", children: "View All" })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: popularItems.map((item) => (_jsx(FoodCard, { item: item }, item.id))) })] }), _jsxs("section", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: "Recommended For You" }), _jsx(Link, { to: ROUTES.CUSTOMER.MENU, className: "text-sm font-medium text-primary-500 hover:text-primary-600", children: "View All" })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: recommendedItems.map((item) => (_jsx(FoodCard, { item: item }, item.id))) })] }), _jsxs("section", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: "Best Sellers" }), _jsx(Link, { to: ROUTES.CUSTOMER.MENU, className: "text-sm font-medium text-primary-500 hover:text-primary-600", children: "View All" })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: bestSellers.map((item) => (_jsx(FoodCard, { item: item }, item.id))) })] }), _jsxs("section", { className: "pb-8", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: "New Arrivals" }), _jsx(Link, { to: ROUTES.CUSTOMER.MENU, className: "text-sm font-medium text-primary-500 hover:text-primary-600", children: "View All" })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: newArrivals.map((item) => (_jsx(FoodCard, { item: item }, item.id))) })] })] }));
}
