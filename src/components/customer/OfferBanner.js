import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
export default function OfferBanner({ offer }) {
    const gradientColors = [
        'from-primary-500 to-primary-700',
        'from-secondary-500 to-secondary-700',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
    ];
    const randomGradient = useMemo(() => {
        const hash = Array.from(offer.id)
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradientColors[hash % gradientColors.length];
    }, [offer.id]);
    return (_jsxs("div", { className: `relative overflow-hidden rounded-2xl bg-gradient-to-br ${randomGradient} p-6 text-white`, children: [_jsx("div", { className: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" }), _jsx("div", { className: "absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" }), _jsx("div", { className: "absolute right-12 bottom-4 h-16 w-16 rounded-full bg-white/5" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "mb-3", children: _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm", children: [_jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" }) }), "Limited Offer"] }) }), _jsx("h3", { className: "mb-1 text-xl font-bold", children: offer.title }), _jsx("p", { className: "mb-4 text-sm text-white/80 line-clamp-2", children: offer.description }), _jsx("div", { className: "flex items-center justify-between", children: _jsx("span", { className: "text-2xl font-bold", children: offer.discountType === 'percentage'
                                ? `${offer.discountValue}% OFF`
                                : `$${offer.discountValue} OFF` }) })] })] }));
}
