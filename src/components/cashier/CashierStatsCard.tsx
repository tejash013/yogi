import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/utils';

interface Props {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'neutral';
  sub?: string;
}

const accentMap: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
};

export default function CashierStatsCard({ label, value, icon, accent = 'primary', sub }: Props) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{sub}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              accentMap[accent]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
