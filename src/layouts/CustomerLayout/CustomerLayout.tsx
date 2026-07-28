import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/customer';
import { useCartStore } from '@/store';

export default function CustomerLayout() {
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-16 dark:bg-neutral-900 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              RestaurantOS
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cartCount > 0 && (
              <div className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                {cartCount} in cart
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}

