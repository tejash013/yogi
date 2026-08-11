import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import AdminLayout from '@/layouts/AdminLayout';
import KitchenLayout from '@/layouts/KitchenLayout';
import CashierLayout from '@/layouts/CashierLayout';
import OwnerLayout from '@/layouts/OwnerLayout';

import SplashScreen from '@/pages/SplashScreen';
import WelcomeScreen from '@/pages/WelcomeScreen';

// Auth Pages
import { Login, Register, ForgotPassword } from '@/pages/auth';

// Customer Pages
import {
  CustomerHome,
  Menu,
  FoodDetails,
  Cart,
  Checkout,
  OrderSuccess,
  OrderTracking,
  MyOrders,
  CustomerProfile,
  Favorites,
  Rewards,
  Coupons,
  Feedback,
} from '@/pages/customer';

// Admin Pages
import {
  AdminDashboard,
  MenuManagement,
  AdminCategories,
  AdminOrders,
  AdminCustomers,
  AdminEmployees,
  AdminTables,
  AdminInventory,
  AdminReports,
  AdminSettings,
} from '@/pages/admin';

// Kitchen Pages
import {
  KitchenDashboard,
  LiveOrders,
  Preparing,
  Ready,
  Completed,
} from '@/pages/kitchen';

// Cashier Pages
import {
  CashierDashboard,
  Billing,
  Payments,
  Invoices,
} from '@/pages/cashier';

// Owner Pages
import {
  OwnerDashboard,
  Analytics,
  Revenue,
  Expenses,
  OwnerReports,
} from '@/pages/owner';

// Error Pages
import Error403 from '@/pages/errors/Error403';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const router = createBrowserRouter([
  // Root redirect
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.DEFAULT} replace />,
  },

  // Splash & Welcome
  { path: ROUTES.SPLASH, element: <SplashScreen /> },
  { path: ROUTES.WELCOME, element: <WelcomeScreen /> },

  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.AUTH.LOGIN} replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },

  // Customer routes
  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.CUSTOMER.HOME} replace /> },
      { path: 'home', element: <CustomerHome /> },
      { path: 'menu', element: <Menu /> },
      { path: 'menu/:id', element: <FoodDetails /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order-success', element: <OrderSuccess /> },
      { path: 'orders', element: <MyOrders /> },
      { path: 'order-tracking/:orderId', element: <OrderTracking /> },
      { path: 'profile', element: <CustomerProfile /> },
      { path: 'favorites', element: <Favorites /> },
      { path: 'rewards', element: <Rewards /> },
      { path: 'coupons', element: <Coupons /> },
      { path: 'feedback', element: <Feedback /> },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'menu', element: <MenuManagement /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'employees', element: <AdminEmployees /> },
      { path: 'tables', element: <AdminTables /> },
      { path: 'inventory', element: <AdminInventory /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  // Kitchen routes
  {
    path: '/kitchen',
    element: (
      <ProtectedRoute roles={['kitchen', 'admin']}>
        <KitchenLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace /> },
      { path: 'dashboard', element: <KitchenDashboard /> },
      { path: 'live-orders', element: <LiveOrders /> },
      { path: 'preparing', element: <Preparing /> },
      { path: 'ready', element: <Ready /> },
      { path: 'completed', element: <Completed /> },
    ],
  },

  // Cashier routes
  {
    path: '/cashier',
    element: (
      <ProtectedRoute roles={['cashier', 'admin']}>
        <CashierLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.CASHIER.DASHBOARD} replace /> },
      { path: 'dashboard', element: <CashierDashboard /> },
      { path: 'billing', element: <Billing /> },
      { path: 'payments', element: <Payments /> },
      { path: 'invoices', element: <Invoices /> },
    ],
  },

  // Owner routes
  {
    path: '/owner',
    element: (
      <ProtectedRoute roles={['owner']}>
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.OWNER.DASHBOARD} replace /> },
      { path: 'dashboard', element: <OwnerDashboard /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'revenue', element: <Revenue /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'reports', element: <OwnerReports /> },
    ],
  },

  // Error routes
  {
    path: '/error',
    children: [
      { path: '403', element: <Error403 /> },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-2 text-neutral-500">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-8">
          <a
            href={ROUTES.DEFAULT}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default router;
