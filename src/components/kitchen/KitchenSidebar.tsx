import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useAuthStore, useKitchenStore } from '@/store';
import TenantSelector from '@/components/common/TenantSelector';

const navItems = [
  {
    label: 'Dashboard',
    href: ROUTES.KITCHEN.DASHBOARD,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Live Orders',
    href: ROUTES.KITCHEN.LIVE_ORDERS,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    countKey: 'active' as const,
  },
  {
    label: 'Preparing',
    href: ROUTES.KITCHEN.PREPARING,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    countKey: 'preparing' as const,
  },
  {
    label: 'Ready',
    href: ROUTES.KITCHEN.READY,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    countKey: 'ready' as const,
  },
  {
    label: 'Completed',
    href: ROUTES.KITCHEN.COMPLETED,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function KitchenSidebar({ isOpen, onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const orders = useKitchenStore((s) => s.orders);

  const counts = {
    active: orders.filter((o) => ['new', 'confirmed'].includes(o.status)).length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-neutral-700 dark:bg-neutral-900',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <TenantSelector variant="card" className="mb-3" />
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const count = item.countKey ? counts[item.countKey] : null;
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
                    {count !== null && count > 0 && (
                      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-white">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'KS'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Kitchen Staff'}
              </p>
              <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                Kitchen Station
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-500 hover:text-white dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

