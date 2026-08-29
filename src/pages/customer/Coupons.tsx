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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">My Coupons</h1>

      {/* Active Coupons */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
          Active Coupons ({activeCoupons.length})
        </h2>
        <div className="space-y-4">
          {activeCoupons.map((coupon) => (
            <CouponCard
              key={coupon.code}
              {...coupon}
              onCopy={() => handleCopyCode(coupon.code)}
              onApply={() => alert(`Coupon ${coupon.code} applied!`)}
            />
          ))}
        </div>
      </section>

      {/* Enter Coupon Code */}
      <Card>
        <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Enter Coupon Code</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
          />
          <Button>Apply</Button>
        </div>
      </Card>

      {/* Expired Coupons */}
      {expiredCoupons.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
            Expired Coupons ({expiredCoupons.length})
          </h2>
          <div className="space-y-4">
            {expiredCoupons.map((coupon) => (
              <CouponCard key={coupon.code} {...coupon} isExpired />
            ))}
          </div>
        </section>
      )}

      {/* Terms */}
      <Card className="bg-neutral-50 dark:bg-neutral-800/50">
        <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">Terms & Conditions</h3>
        <ul className="space-y-1 text-sm text-neutral-500">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            Coupons cannot be clubbed with other offers
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            Valid only on minimum order value mentioned
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            One coupon per order
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            Coupons are non-transferable
          </li>
        </ul>
      </Card>

      {/* Copied toast */}
      {copiedCode && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-neutral-900">
          Coupon code {copiedCode} copied!
        </div>
      )}
    </div>
  );
}

