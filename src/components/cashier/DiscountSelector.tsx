import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useCashierStore } from '@/store';
import { cn } from '@/utils';

type Tab = 'coupon' | 'percentage' | 'fixed';

export default function DiscountSelector() {
  const [tab, setTab] = useState<Tab>('coupon');
  const [couponInput, setCouponInput] = useState('');
  const percentageDiscount = useCashierStore((s) => s.percentageDiscount);
  const fixedDiscount = useCashierStore((s) => s.fixedDiscount);
  const applyCoupon = useCashierStore((s) => s.applyCoupon);
  const applyPercentageDiscount = useCashierStore((s) => s.applyPercentageDiscount);
  const applyFixedDiscount = useCashierStore((s) => s.applyFixedDiscount);
  const discount = useCashierStore((s) => s.discount);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'coupon', label: 'Coupon' },
    { key: 'percentage', label: '% Off' },
    { key: 'fixed', label: 'Fixed ₹' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              tab === t.key
                ? 'bg-white text-primary-600 shadow-sm dark:bg-neutral-800 dark:text-primary-400'
                : 'text-neutral-500 dark:text-neutral-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {discount && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-900/20">
          <span className="font-medium text-green-700 dark:text-green-300">
            {discount.name} applied
          </span>
        </div>
      )}

      {tab === 'coupon' && (
        <div className="space-y-2">
          <Input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
          />
          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              if (couponInput.trim()) applyCoupon(couponInput);
            }}
          >
            Apply Coupon
          </Button>
        </div>
      )}

      {tab === 'percentage' && (
        <Input
          type="number"
          min={0}
          max={100}
          value={percentageDiscount}
          onChange={(e) => applyPercentageDiscount(e.target.value)}
          placeholder="e.g. 10"
          helperText="Percentage off (0–100)"
        />
      )}

      {tab === 'fixed' && (
        <Input
          type="number"
          min={0}
          value={fixedDiscount}
          onChange={(e) => applyFixedDiscount(e.target.value)}
          placeholder="e.g. 50"
          helperText="Fixed amount in ₹"
        />
      )}
    </div>
  );
}
