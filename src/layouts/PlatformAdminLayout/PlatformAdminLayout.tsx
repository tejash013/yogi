import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';

export default function PlatformAdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const signOut = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#17211d]">
      <Navbar
        brand="RestaurantOS Platform"
        showThemeToggle={true}
        showMobileMenu={false}
        showAuthControls={false}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="hidden h-10 items-center rounded-xl bg-[#e8f1d2] px-4 text-xs font-bold text-[#526000] sm:inline-flex">Platform Admin</span>
            <button type="button" onClick={signOut} className="inline-flex h-10 min-w-24 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 hover:bg-red-100">Sign out</button>
            <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="inline-flex h-10 min-w-24 items-center justify-center rounded-xl border border-[#ddd3c4] bg-white px-4 text-sm lg:hidden" aria-label="Toggle platform navigation">Menu</button>
          </div>
        }
      />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:px-12">
        <aside className={`${isMenuOpen ? 'block' : 'hidden'} w-full shrink-0 rounded-[1.75rem] border border-[#dfd9cc] bg-white p-3 shadow-sm lg:block lg:w-60`}>
          <div className="mb-4 px-3 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#df714c]">Control plane</p>
            <p className="mt-1 text-sm text-[#68736d]">{user?.email}</p>
          </div>
          {[{ label: 'Platform Dashboard', href: ROUTES.PLATFORM_ADMIN.DASHBOARD }, { label: 'User Access', href: ROUTES.PLATFORM_ADMIN.USERS }].map((item) => (
            <Link key={item.href} to={item.href} onClick={() => setIsMenuOpen(false)} className={`mb-1 flex h-11 items-center rounded-xl px-3 text-sm font-semibold ${location.pathname === item.href ? 'bg-[#173c35] text-white' : 'text-[#52605a] hover:bg-[#f4f1ea]'}`}>
              {item.label}
            </Link>
          ))}
        </aside>
        <main className="min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  );
}