import { Badge, Button } from '@/components/ui';

interface CouponCardProps {
  code: string;
  description: string;
  discountValue: string;
  minOrder: string;
  validUntil: string;
  isExpired?: boolean;
  onApply?: () => void;
  onCopy?: () => void;
}

export default function CouponCard({
  code,
  description,
  discountValue,
  minOrder,
  validUntil,
  isExpired = false,
  onApply,
  onCopy,
}: CouponCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md ${
      isExpired
        ? 'border-neutral-200 opacity-60 dark:border-neutral-700'
        : 'border-primary-200 bg-gradient-to-r from-primary-50 to-white dark:border-primary-800 dark:from-primary-900/20 dark:to-neutral-800'
    }`}>
      {/* Coupon Cutout Left */}
      <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900" />
      {/* Coupon Cutout Right */}
      <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900" />

      <div className="flex items-center gap-4 p-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
          <span className="text-2xl">{isExpired ? '💤' : '🏷️'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={isExpired ? 'neutral' : 'primary'} size="sm">
              {code}
            </Badge>
            {isExpired && (
              <span className="text-xs font-medium text-neutral-400">Expired</span>
            )}
          </div>
          <p className="font-semibold text-neutral-900 dark:text-white">{description}</p>
          <p className="text-xs text-neutral-500">
            Min. {minOrder} · Valid until {validUntil}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="whitespace-nowrap text-lg font-bold text-primary-500">
            {discountValue}
          </span>
          {!isExpired && onApply && (
            <Button size="sm" variant="outline" onClick={onApply}>
              Apply
            </Button>
          )}
          {onCopy && (
            <button
              onClick={onCopy}
              className="text-xs font-medium text-primary-500 hover:text-primary-600"
            >
              Copy Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

