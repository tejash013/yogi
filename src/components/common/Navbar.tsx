import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/store';
import { cn } from '@/utils';

export interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  brand?: string;
  items?: NavItem[];
  showThemeToggle?: boolean;
  showMobileMenu?: boolean;
  rightContent?: React.ReactNode;
}

export default function Navbar({
  brand = 'RestaurantOS',
  items = [],
  showThemeToggle = true,
  showMobileMenu = true,
  rightContent,
}: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {brand}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {items.length > 0 && (
            <div className="hidden items-center gap-1 md:flex">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}
            {rightContent}
            {showMobileMenu && (
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && items.length > 0 && (
        <div className="border-t border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 md:hidden">
          <div className="space-y-1 px-4 py-3">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

