import { useEffect, useMemo, useState } from 'react';
import { Button, Card, EmptyState } from '@/components/ui';
import { CouponCard } from '@/components/customer';
import { offersApi } from '@/api';
import { useToastStore } from '@/store';
import { formatCurrency } from '@/utils';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await offersApi.getCoupons();
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setCoupons(list);
    } catch {
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const now = new Date().getTime();

  const formattedCoupons = useMemo(() => {
    return coupons.map((c) => {
      const isExpired = c.isActive === false || (c.validUntil && new Date(c.validUntil).getTime() < now);
      const discountText = c.discountType === 'percentage'
        ? `${c.discountValue}% OFF`
        : `${formatCurrency(c.discountValue)} OFF`;

      const validUntilText = c.validUntil
        ? new Date(c.validUntil).toLocaleDateString('en-IN', { dateStyle: 'medium' })
        : 'Indefinite';

      return {
        code: c.code,
        description: c.description || c.title || 'Special discount on all items',
        discountValue: discountText,
        minOrder: formatCurrency(c.minOrderAmount || 0),
        validUntil: validUntilText,
        isExpired,
      };
    });
  }, [coupons, now]);

  const activeCoupons = formattedCoupons.filter((c) => !c.isExpired);
  const expiredCoupons = formattedCoupons.filter((c) => c.isExpired);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  const handleValidateCoupon = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a coupon code', 'warning');
      return;
    }

    setIsValidating(true);
    try {
      const res = await offersApi.validateCoupon(code);
      const data = res.data?.data;
      if (data && data.code) {
        const discountLabel = data.discountType === 'percentage' ? `${data.discountValue}%` : formatCurrency(data.discountValue);
        showToast(`Coupon ${code} is valid! You receive ${discountLabel} off.`, 'success');
      } else {
        showToast('Invalid or expired coupon code', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Active Coupons & Offers</h1>

      {/* Enter Coupon Code */}
      <Card>
        <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Have a Promo Code?</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g. FESTIVE20"
            className="flex-1 uppercase rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
          />
          <Button onClick={handleValidateCoupon} isLoading={isValidating}>
            Verify Code
          </Button>
        </div>
      </Card>

      {/* Active Coupons */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
          Available Coupons ({activeCoupons.length})
        </h2>
        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading coupons...</p>
        ) : activeCoupons.length === 0 ? (
          <EmptyState title="No active coupons" description="Check back soon for upcoming holiday promotions and discounts." />
        ) : (
          <div className="space-y-4">
            {activeCoupons.map((coupon) => (
              <CouponCard
                key={coupon.code}
                {...coupon}
                onCopy={() => handleCopyCode(coupon.code)}
                onApply={() => handleCopyCode(coupon.code)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Expired Coupons */}
      {expiredCoupons.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
            Past Coupons ({expiredCoupons.length})
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
        <ul className="space-y-1.5 text-sm text-neutral-500">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            Coupons cannot be clubbed with other simultaneous promotions.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            Valid only on minimum order subtotals specified on the coupon card.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            Offers are subject to tenant availability and stock limits.
          </li>
        </ul>
      </Card>
    </div>
  );
}
