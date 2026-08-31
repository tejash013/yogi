import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar, { type SidebarItem } from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import TenantSelector from '@/components/common/TenantSelector';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';

const sidebarItems: SidebarItem[] = [
  {
    label: 'Manager Portal',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h10" />
      </svg>
    ),
    href: ROUTES.ADMIN.DASHBOARD,
  },
  {
    label: 'Manage Staff',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2a5 5 0 0110 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: ROUTES.ADMIN.EMPLOYEES,
  },
  {
    label: 'Dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    href: ROUTES.OWNER.DASHBOARD,
  },
  {
    label: 'Analytics',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    href: ROUTES.OWNER.ANALYTICS,
  },
  {
    label: 'Revenue',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: ROUTES.OWNER.REVENUE,
  },
  {
    label: 'Expenses',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: ROUTES.OWNER.EXPENSES,
  },
  {
    label: 'Reports',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: ROUTES.OWNER.REPORTS,
  },
];

export default function OwnerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const getUserInitials = () => {
    if (!user) return 'O';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return first + last || 'O';
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar
        brand="RestaurantOS Owner"
        showThemeToggle={true}
        showMobileMenu={false}
        showAuthControls={false}
        rightContent={
          <div className="flex items-center gap-2">
            {/* Desktop user profile + logout */}
            <div className="hidden items-center gap-2 md:flex">
              <TenantSelector variant="pill" />

              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  {getUserInitials()}
                </div>
                <div className="text-left leading-none">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Owner'}
                  </p>
                  <p className="text-[10px] capitalize text-neutral-500 dark:text-neutral-400">
                    {user?.role || 'Owner'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                title="Log out of account"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile drawer toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
              aria-label="Toggle navigation drawer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        }
      />
      <div className="flex flex-1">
        <Sidebar
          items={sidebarItems}
          variant="owner"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:ml-72 lg:p-8">
          <TenantSelector variant="banner" showDetails={true} className="mb-6" />

          <div className="mb-6 rounded-[2rem] border border-neutral-200 bg-white/90 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900/90">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">Owner panel</p>
                <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">Welcome back, {user?.firstName || 'Owner'}</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Access revenue, analytics, expenses and reports from one place.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-neutral-50 p-3 text-center dark:bg-neutral-800">
                    <p className="text-xs text-neutral-500">Revenue</p>
                    <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">₹48.2K</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-3 text-center dark:bg-neutral-800">
                    <p className="text-xs text-neutral-500">Reports</p>
                    <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">6</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-3 text-center dark:bg-neutral-800">
                    <p className="text-xs text-neutral-500">Margin</p>
                    <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">26%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}



