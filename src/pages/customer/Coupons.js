import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { CouponCard } from '@/components/customer';
const coupons = [
    { code: 'FIRST10', description: '₹10 off on first order above ₹30', discountValue: '₹10 OFF', minOrder: '₹30', validUntil: 'Dec 31, 2025', isExpired: false },
    { code: 'WELCOME20', description: '20% off on your next order', discountValue: '20% OFF', minOrder: '₹20', validUntil: 'Dec 31, 2025', isExpired: false },
    { code: 'HAPPYHOUR', description: '15% off on beverages 4-7 PM', discountValue: '15% OFF', minOrder: '₹10', validUntil: 'Dec 31, 2025', isExpired: false },
    { code: 'FAMILYFEAST', description: 'Free dessert with 2 main courses', discountValue: 'FREE DESSERT', minOrder: '₹30', validUntil: 'Mar 15, 2025', isExpired: true },
    { code: 'LOYALTY50', description: '₹5 off for loyalty members', discountValue: '₹5 OFF', minOrder: '₹15', validUntil: 'Feb 28, 2025', isExpired: true },
];
export default function Coupons() {
    const [copiedCode, setCopiedCode] = useState('');
    const activeCoupons = coupons.filter((c) => !c.isExpired);
    const expiredCoupons = coupons.filter((c) => c.isExpired);
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };
    return (_jsxs("div", { className: "space-y-6 pb-8", children: [_jsx("h1", { className: "text-xl font-bold text-neutral-900 dark:text-white", children: "My Coupons" }), _jsxs("section", { children: [_jsxs("h2", { className: "mb-4 text-lg font-bold text-neutral-900 dark:text-white", children: ["Active Coupons (", activeCoupons.length, ")"] }), _jsx("div", { className: "space-y-4", children: activeCoupons.map((coupon) => (_jsx(CouponCard, { ...coupon, onCopy: () => handleCopyCode(coupon.code), onApply: () => alert(`Coupon ${coupon.code} applied!`) }, coupon.code))) })] }), _jsxs(Card, { children: [_jsx("h3", { className: "mb-3 font-semibold text-neutral-900 dark:text-white", children: "Enter Coupon Code" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter coupon code", className: "flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800" }), _jsx(Button, { children: "Apply" })] })] }), expiredCoupons.length > 0 && (_jsxs("section", { children: [_jsxs("h2", { className: "mb-4 text-lg font-bold text-neutral-900 dark:text-white", children: ["Expired Coupons (", expiredCoupons.length, ")"] }), _jsx("div", { className: "space-y-4", children: expiredCoupons.map((coupon) => (_jsx(CouponCard, { ...coupon, isExpired: true }, coupon.code))) })] })), _jsxs(Card, { className: "bg-neutral-50 dark:bg-neutral-800/50", children: [_jsx("h3", { className: "mb-2 font-semibold text-neutral-900 dark:text-white", children: "Terms & Conditions" }), _jsxs("ul", { className: "space-y-1 text-sm text-neutral-500", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" }), "Coupons cannot be clubbed with other offers"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" }), "Valid only on minimum order value mentioned"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" }), "One coupon per order"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" }), "Coupons are non-transferable"] })] })] }), copiedCode && (_jsxs("div", { className: "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-neutral-900", children: ["Coupon code ", copiedCode, " copied!"] }))] }));
}
