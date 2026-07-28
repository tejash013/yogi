import { Outlet } from 'react-router-dom';
import Logo from '@/components/common/Logo';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Left side - Brand/Illustration */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="mb-8 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <span className="text-2xl font-bold text-white">R</span>
            </div>
            <span className="text-3xl font-bold text-white">RestaurantOS</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">
            Complete Restaurant Management
          </h1>
          <p className="text-lg text-white/80">
            Streamline your restaurant operations with our all-in-one management
            platform. Manage orders, inventory, staff, and more.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-white/70">Restaurants</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-white/70">Daily Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-white/70">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Logo size="lg" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

