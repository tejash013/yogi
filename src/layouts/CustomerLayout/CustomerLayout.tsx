import { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Footer, TenantSelector } from '@/components/common';
import type { NavItem } from '@/components/common/Navbar';
import { BottomNav } from '@/components/customer';
import { ROUTES } from '@/constants';
import { useAuthStore, useCartStore, useTenantStore } from '@/store';

const navItems: NavItem[] = [
  { label: 'Home', href: ROUTES.CUSTOMER.HOME },
  { label: 'Menu', href: ROUTES.CUSTOMER.MENU },
  { label: 'Tables 🪑', href: ROUTES.CUSTOMER.TABLES },
  { label: 'My Orders', href: ROUTES.CUSTOMER.MY_ORDERS },
  { label: 'Favorites', href: ROUTES.CUSTOMER.FAVORITES },
  { label: 'Rewards', href: ROUTES.CUSTOMER.REWARDS },
  { label: 'Coupons', href: ROUTES.CUSTOMER.COUPONS },
  { label: 'Feedback', href: ROUTES.CUSTOMER.FEEDBACK },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const userLocation = useTenantStore((s) => s.userLocation);
  const isLocating = useTenantStore((s) => s.isLocating);
  const requestUserLocation = useTenantStore((s) => s.requestUserLocation);

  // Non-blocking auto location resolution for customers
  useEffect(() => {
    if (!userLocation && !isLocating) {
      void requestUserLocation();
    }
  }, [userLocation, isLocating, requestUserLocation]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-16 dark:bg-neutral-900 lg:pb-0">
      {/* Header */}
      <Navbar
        items={navItems}
        rightContent={
          <>
            <TenantSelector variant="pill" className="max-w-[180px] sm:max-w-none" />

            <Link
              to={ROUTES.CUSTOMER.CART}
              className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
              title="Cart"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.CUSTOMER.PROFILE}
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white md:block"
                >
                  {user?.firstName ? `Hi, ${user.firstName}` : 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden rounded-lg bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 md:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white md:block"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="hidden rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 md:block"
                >
                  Register
                </Link>
              </>
            )}
          </>
        }
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer (Desktop) */}
      <Footer />

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
