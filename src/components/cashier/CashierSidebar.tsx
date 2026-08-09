import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiBell,
  FiFileText,
  FiGrid,
  FiLock,
  FiLogOut,
  FiShoppingCart,
} from 'react-icons/fi';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useCashierStore, formatINR } from '@/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function CashierSidebar({ isOpen, onClose, onLogout }: Props) {
  const location = useLocation();
  const orders = useCashierStore((s) => s.orders);
  const payments = useCashierStore((s) => s.payments);
  const invoices = useCashierStore((s) => s.invoices);
  const shiftStatus = useCashierStore((s) => s.shiftStatus);

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
    return {
      pendingBills,
      unpaidPayments,
      todayInvoices,
      totalShift: payments
        .filter((p) => p.status === 'paid')
        .reduce((s, p) => s + p.amount, 0),
    };
  }, [orders, payments, invoices]);

  const navItems = [
    {
      label: 'Dashboard',
      href: ROUTES.CASHIER.DASHBOARD,
      icon: <FiGrid className="h-5 w-5" />,
      count: null as number | null,
    },
    {
      label: 'Billing',
      href: ROUTES.CASHIER.BILLING,
      icon: <FiShoppingCart className="h-5 w-5" />,
      count: counters.pendingBills,
    },
    {
      label: 'Payments',
      href: ROUTES.CASHIER.PAYMENTS,
      icon: <FiBell className="h-5 w-5" />,
      count: counters.unpaidPayments,
    },
    {
      label: 'Invoices',
      href: ROUTES.CASHIER.INVOICES,
      icon: <FiFileText className="h-5 w-5" />,
      count: counters.todayInvoices,
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-neutral-700 dark:bg-neutral-900',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Cashier
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.count !== null && item.count > 0 && (
                      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
                        {item.count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Useful counters */}
          <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Overview
            </p>
            <div className="space-y-2 px-3 text-sm text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center justify-between">
                <span>Pending Bills</span>
                <span className="font-semibold">{counters.pendingBills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unpaid Payments</span>
                <span className="font-semibold">{counters.unpaidPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Today&apos;s Invoices</span>
                <span className="font-semibold">{counters.todayInvoices}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
          <div className="mb-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-300">Shift Collection</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {formatINR(counters.totalShift)}
            </p>
          </div>
          <div className="mb-3 flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Shift: <span className="capitalize font-medium">{shiftStatus}</span></span>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <FiLogOut className="h-4 w-4" /> Logout
          </button>
          <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-neutral-400">
            <FiLock className="h-3 w-3" /> Cashier Control · v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
