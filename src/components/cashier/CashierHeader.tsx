import { useEffect, useState } from 'react';
import { FiBell, FiMenu } from 'react-icons/fi';
import { cn } from '@/utils';
import { useAuthStore, useCashierStore } from '@/store';
import Logo from '@/components/common/Logo';

interface Props {
  onMenuClick: () => void;
}

/**
 * Cashier header with logo, title, live clock, notifications, profile,
 * shift status and logout.
 */
export default function CashierHeader({ onMenuClick }: Props) {
  const [now, setNow] = useState(() => new Date());
  const user = useAuthStore((s) => s.user);
  const shiftStatus = useCashierStore((s) => s.shiftStatus);
  const toggleShift = useCashierStore((s) => s.toggleShift);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-900/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <Logo size="sm" showText={false} />
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-neutral-900 dark:text-white">Cashier</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">RestaurantOS · Billing</p>
          </div>
        </div>

        {/* Center: date/time (desktop) */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{dateStr}</p>
            <p className="font-mono text-sm text-primary-500">{timeStr}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Shift status */}
          <button
            onClick={toggleShift}
            className={cn(
              'hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:flex',
              shiftStatus === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                shiftStatus === 'active' ? 'bg-green-500' : 'bg-neutral-400'
              )}
            />
            {shiftStatus === 'active' ? 'Shift Active' : shiftStatus === 'break' ? 'On Break' : 'Shift Closed'}
          </button>

          {/* Notifications */}
          <button
            className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5 dark:border-neutral-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'MK'}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Meera K'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                {user?.role || 'Cashier'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


