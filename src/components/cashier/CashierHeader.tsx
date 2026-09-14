import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingCart,
  FiCreditCard,
  FiFileText,
  FiPlus,
  FiLogOut,
  FiClock,
  FiMenu,
  FiX,
  FiDollarSign,
} from 'react-icons/fi';
import { cn } from '@/utils';
import { useAuthStore, useCashierStore, formatINR } from '@/store';
import { ROUTES } from '@/constants';
import Logo from '@/components/common/Logo';
import TenantSelector from '@/components/common/TenantSelector';

interface Props {
  onMenuClick?: () => void;
  onLogout?: () => void;
}

/**
 * Top header navigation bar for Cashier Portal.
 * Replaces the left sidebar with header navigation tabs, "+ New POS Bill" button,
 * live counters, shift status, and cashier user details.
 */
export default function CashierHeader({ onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const orders = useCashierStore((s) => s.orders);
  const payments = useCashierStore((s) => s.payments);
  const invoices = useCashierStore((s) => s.invoices);
  const shiftStatus = useCashierStore((s) => s.shiftStatus);
  const toggleShift = useCashierStore((s) => s.toggleShift);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  const counters = useMemo(() => {
    const pendingBills = orders.filter(
      (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'pending' || o.paymentStatus === 'partially_paid'
    ).length;
    const unpaidPayments = payments.filter(
      (p) => p.status === 'pending' || p.status === 'failed'
    ).length;
    const today = new Date().toDateString();
    const todayInvoices = invoices.filter(
      (i) => new Date(i.issuedAt).toDateString() === today
    ).length;
    const totalShift = payments
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0);

    return { pendingBills, unpaidPayments, todayInvoices, totalShift };
  }, [orders, payments, invoices]);

  const navItems = [
    {
      label: 'Dashboard',
      href: ROUTES.CASHIER.DASHBOARD,
      icon: <FiGrid className="h-4 w-4" />,
      count: null,
    },
    {
      label: 'POS Billing',
      href: ROUTES.CASHIER.BILLING,
      icon: <FiShoppingCart className="h-4 w-4" />,
      count: counters.pendingBills,
    },
    {
      label: 'Payments',
      href: ROUTES.CASHIER.PAYMENTS,
      icon: <FiCreditCard className="h-4 w-4" />,
      count: counters.unpaidPayments,
    },
    {
      label: 'Invoices',
      href: ROUTES.CASHIER.INVOICES,
      icon: <FiFileText className="h-4 w-4" />,
      count: counters.todayInvoices,
    },
  ];

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleNewBill = () => {
    if (location.pathname === ROUTES.CASHIER.BILLING) {
      window.dispatchEvent(new CustomEvent('reset-pos-cart'));
    } else {
      navigate(ROUTES.CASHIER.BILLING);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-3 sm:px-4 lg:px-6 gap-2">
        {/* Left: Brand & New Bill */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 xl:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>

          <Logo size="sm" showText={false} />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-none text-neutral-900 dark:text-white">Cashier POS</h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">RestaurantOS</p>
          </div>

          <TenantSelector variant="pill" className="hidden xl:flex text-xs" />

          {/* New POS Bill Action Button */}
          <button
            onClick={handleNewBill}
            className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95"
            title="Create a fresh POS bill"
          >
            <FiPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Bill</span>
          </button>
        </div>

        {/* Center: Top Header Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1.5 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/80">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-white text-primary-600 shadow dark:bg-neutral-700 dark:text-primary-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Shift Status, Clock & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Shift Collection counter */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 dark:border-green-900/40 dark:bg-green-950/30">
            <FiDollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <div className="text-left leading-tight">
              <span className="block text-[10px] font-medium text-green-700 dark:text-green-300 uppercase">Shift Total</span>
              <span className="block text-xs font-bold text-green-800 dark:text-green-200">{formatINR(counters.totalShift)}</span>
            </div>
          </div>

          {/* Shift Toggle button */}
          <button
            onClick={toggleShift}
            className={cn(
              'hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors',
              shiftStatus === 'active'
                ? 'border-green-300 bg-green-100/60 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                shiftStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'
              )}
            />
            <span>{shiftStatus === 'active' ? 'Shift Active' : 'Shift Closed'}</span>
          </button>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 border-l border-neutral-200 dark:border-neutral-800 pl-3 text-xs text-neutral-500 dark:text-neutral-400">
            <FiClock className="h-3.5 w-3.5 text-neutral-400" />
            <span>{dateStr}</span>
            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{timeStr}</span>
          </div>

          {/* Cashier Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-sm">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Cashier'}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                {user?.role || 'Cashier'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="ml-1 rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Logout"
            >
              <FiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 xl:hidden space-y-2">
          <TenantSelector variant="card" className="mb-2" />
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all',
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400'
                      : 'border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300'
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <span className="rounded-full bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500">Shift Total: <strong>{formatINR(counters.totalShift)}</strong></span>
            <button
              onClick={toggleShift}
              className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
            >
              Toggle Shift ({shiftStatus})
            </button>
          </div>
        </div>
      )}
    </header>
  );
}



