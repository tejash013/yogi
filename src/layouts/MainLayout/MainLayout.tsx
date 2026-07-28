import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import type { NavItem } from '@/components/common/Navbar';

interface MainLayoutProps {
  navItems?: NavItem[];
  sidebar?: React.ReactNode;
  showFooter?: boolean;
}

export default function MainLayout({
  navItems = [],
  sidebar,
  showFooter = true,
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar
        items={navItems}
        showMobileMenu={true}
        rightContent={
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
      />

      <div className="flex flex-1">
        {sidebar && (
          <div className="hidden lg:block">
            {sidebar}
          </div>
        )}

        {/* Mobile sidebar trigger */}
        {sidebar && (
          <div
            className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden ${
              isSidebarOpen ? 'block' : 'hidden'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

