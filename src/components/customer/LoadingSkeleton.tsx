import { cn } from '@/utils';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'detail' | 'text';
  count?: number;
  className?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700',
        className
      )}
    />
  );
}

function FoodCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <SkeletonBlock className="mb-3 h-40 w-full rounded-xl" />
      <SkeletonBlock className="mb-2 h-5 w-3/4" />
      <SkeletonBlock className="mb-2 h-4 w-1/2" />
      <SkeletonBlock className="mb-3 h-4 w-full" />
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-20" />
        <SkeletonBlock className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <SkeletonBlock className="h-16 w-16 flex-shrink-0 rounded-lg" />
      <div className="flex-1">
        <SkeletonBlock className="mb-2 h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
      <SkeletonBlock className="h-6 w-16" />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-64 w-full rounded-2xl" />
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-3/4" />
        <SkeletonBlock className="h-4 w-1/4" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function LoadingSkeleton({
  type = 'card',
  count = 6,
  className,
}: LoadingSkeletonProps) {
  if (type === 'detail') return <DetailSkeleton />;
  if (type === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <ListSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  );
}

