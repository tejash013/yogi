import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import type { KitchenOrder } from '@/types/kitchen';
import { getPrepProgress, isDelayed } from '@/store/kitchenStore';

interface Props {
  order: KitchenOrder;
  compact?: boolean;
}

const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Live preparation timer with a progress bar.
 * Counts elapsed time since the order started preparing.
 */
export default function OrderTimer({ order, compact = false }: Props) {
  const started = order.startedAt || order.acceptedAt || order.createdAt;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedSeconds = started
    ? Math.max(0, (now - new Date(started).getTime()) / 1000)
    : 0;
  const progress = getPrepProgress(order);
  const delayed = isDelayed(order);

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-neutral-500 dark:text-neutral-400">Elapsed</span>
          <span
            className={cn(
              'font-mono font-medium',
              delayed
                ? 'text-error'
                : 'text-neutral-700 dark:text-neutral-200'
            )}
          >
            ⏱ {formatTime(elapsedSeconds)}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        {compact && (
          <span
            className={cn(
              'font-mono text-sm font-medium',
              delayed ? 'text-error' : 'text-neutral-700 dark:text-neutral-200'
            )}
          >
            ⏱ {formatTime(elapsedSeconds)}
          </span>
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              delayed ? 'bg-error' : 'bg-primary-500'
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        {!compact && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {progress}%
          </span>
        )}
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Expected: {order.expectedPrepTimeMin} min
        </p>
      )}
    </div>
  );
}
