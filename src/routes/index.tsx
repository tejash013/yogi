import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuthStore } from '@/store';

const RELOAD_KEY = 'yogi_route_chunk_reload';

function safeImport<T>(importFn: () => Promise<T>): Promise<T> {
  return importFn().catch((error) => {
    const msg = String(error?.message || error || '');
    const isChunkError =
      error instanceof TypeError ||
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('loading chunk');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadCount = Number(sessionStorage.getItem(RELOAD_KEY) || '0');
      if (reloadCount < 2) {
        sessionStorage.setItem(RELOAD_KEY, String(reloadCount + 1));
        window.location.reload();
        return new Promise<never>(() => {});
      }
    }
    throw error;
  });
}

function safeLazy<T extends React.ComponentType<any>>(importFn: () => Promise<{ default: T }>) {
  return lazy(() => safeImport(importFn));
}

const AuthLayout = safeLazy(() => import('@/layouts/AuthLayout'));
const CustomerLayout = safeLazy(() => import('@/layouts/CustomerLayout'));
const AdminLayout = safeLazy(() => import('@/layouts/AdminLayout'));
const KitchenLayout = safeLazy(() => import('@/layouts/KitchenLayout'));
const CashierLayout = safeLazy(() => import('@/layouts/CashierLayout'));
const OwnerLayout = safeLazy(() => import('@/layouts/OwnerLayout'));
const PlatformAdminLayout = safeLazy(() => import('@/layouts/PlatformAdminLayout'));

const SplashScreen = safeLazy(() => import('@/pages/SplashScreen'));
const WelcomeScreen = safeLazy(() => import('@/pages/WelcomeScreen'));
const Login = safeLazy(() => import('@/pages/auth/Login'));
const Register = safeLazy(() => import('@/pages/auth/Register'));
const ForgotPassword = safeLazy(() => import('@/pages/auth/ForgotPassword'));
const CustomerHome = safeLazy(() => import('@/pages/customer/Home'));
const Menu = safeLazy(() => import('@/pages/customer/Menu'));
const FoodDetails = safeLazy(() => import('@/pages/customer/FoodDetails'));
const Cart = safeLazy(() => import('@/pages/customer/Cart'));
const Checkout = safeLazy(() => import('@/pages/customer/Checkout'));
const OrderSuccess = safeLazy(() => import('@/pages/customer/OrderSuccess'));
const OrderTracking = safeLazy(() => import('@/pages/customer/OrderTracking'));
const MyOrders = safeLazy(() => import('@/pages/customer/MyOrders'));
const CustomerProfile = safeLazy(() => import('@/pages/customer/Profile'));
const Favorites = safeLazy(() => import('@/pages/customer/Favorites'));
const Feedback = safeLazy(() => import('@/pages/customer/Feedback'));
const ScanTable = safeLazy(() => import('@/pages/customer/ScanTable'));
const AdminDashboard = safeLazy(() => import('@/pages/admin/Dashboard'));
const MenuManagement = safeLazy(() => import('@/pages/admin/MenuManagement'));
const AdminCategories = safeLazy(() => import('@/pages/admin/Categories'));
const AdminOrders = safeLazy(() => import('@/pages/admin/Orders'));
const AdminInvoices = safeLazy(() => import('@/pages/admin/Invoices'));
const AdminCustomers = safeLazy(() => import('@/pages/admin/Customers'));
const AdminEmployees = safeLazy(() => import('@/pages/admin/Employees'));
const AdminTables = safeLazy(() => import('@/pages/admin/Tables'));
const AdminInventory = safeLazy(() => import('@/pages/admin/Inventory'));
const AdminReports = safeLazy(() => import('@/pages/admin/Reports'));
const AdminSettings = safeLazy(() => import('@/pages/admin/Settings'));
const AdminUsers = safeLazy(() => import('@/pages/admin/Users'));
const KitchenDashboard = safeLazy(() => import('@/pages/kitchen/Dashboard'));
const LiveOrders = safeLazy(() => import('@/pages/kitchen/LiveOrders'));
const Completed = safeLazy(() => import('@/pages/kitchen/Completed'));
const CashierDashboard = safeLazy(() => import('@/pages/cashier/Dashboard'));
const Billing = safeLazy(() => import('@/pages/cashier/Billing'));
const Payments = safeLazy(() => import('@/pages/cashier/Payments'));
const Invoices = safeLazy(() => import('@/pages/cashier/Invoices'));
const OwnerDashboard = safeLazy(() => import('@/pages/owner/Dashboard'));
const Analytics = safeLazy(() => import('@/pages/owner/Analytics'));
const Revenue = safeLazy(() => import('@/pages/owner/Revenue'));
const Expenses = safeLazy(() => import('@/pages/owner/Expenses'));
const OwnerReports = safeLazy(() => import('@/pages/owner/Reports'));
const OwnerSubscription = safeLazy(() => import('@/pages/owner/Subscription'));
const Error403 = safeLazy(() => import('@/pages/errors/Error403'));
const Workspace = safeLazy(() => import('@/pages/saas/Workspace'));
const Subscriptions = safeLazy(() => import('@/pages/saas/Subscriptions'));

const router = createBrowserRouter([
  // Root redirect
  {
    path: ROUTES.ROOT,
    element: <RootRedirect />,
  },

  // Splash & Welcome
  { path: ROUTES.SPLASH, element: <SplashScreen /> },
  { path: ROUTES.WELCOME, element: <WelcomeScreen /> },

  {
    path: ROUTES.WORKSPACE,
    element: (
      <ProtectedRoute roles={['platformAdmin', 'owner']}>
        <Workspace />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PLATFORM_ADMIN.DASHBOARD,
    element: (
      <ProtectedRoute roles={['platformAdmin']}>
        <Workspace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/workspace/users',
    element: (
      <ProtectedRoute roles={['platformAdmin']}>
        <PlatformAdminLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <AdminUsers /> }],
  },
  {
    path: ROUTES.PLATFORM_ADMIN.SUBSCRIPTIONS,
    element: (
      <ProtectedRoute roles={['platformAdmin']}>
        <PlatformAdminLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <Subscriptions /> }],
  },

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

  // Table QR Scan routes
  {
    path: '/scan/table/:token',
    element: <ScanTable />,
  },
  {
    path: '/table/:token',
    element: <ScanTable />,
  },
  {
    path: '/t/:token',
    element: <ScanTable />,
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
      { path: 'rewards', element: <Navigate to={ROUTES.CUSTOMER.HOME} replace /> },
      { path: 'coupons', element: <Navigate to={ROUTES.CUSTOMER.HOME} replace /> },
      { path: 'feedback', element: <Feedback /> },
      { path: 'tables', element: <Navigate to={ROUTES.CUSTOMER.HOME} replace /> },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['owner', 'manager', 'platformAdmin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'menu', element: <MenuManagement /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'invoices', element: <AdminInvoices /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'employees', element: <AdminEmployees /> },
      {
        path: 'users',
        element: (
          <ProtectedRoute roles={['owner', 'manager', 'platformAdmin']}>
            <AdminUsers />
          </ProtectedRoute>
        ),
      },
      { path: 'tables', element: <AdminTables /> },
      { path: 'inventory', element: <AdminInventory /> },
      { path: 'reports', element: <AdminReports /> },
      {
        path: 'settings',
        element: (
          <ProtectedRoute roles={['owner', 'manager', 'platformAdmin']}>
            <AdminSettings />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Kitchen routes
  {
    path: '/kitchen',
    element: (
      <ProtectedRoute roles={['chef', 'manager']}>
        <KitchenLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace /> },
      { path: 'dashboard', element: <KitchenDashboard /> },
      { path: 'live-orders', element: <LiveOrders /> },
      { path: 'preparing', element: <Navigate to={ROUTES.KITCHEN.LIVE_ORDERS} replace /> },
      { path: 'ready', element: <Navigate to={ROUTES.KITCHEN.LIVE_ORDERS} replace /> },
      { path: 'completed', element: <Completed /> },
    ],
  },

  // Cashier routes
  {
    path: '/cashier',
    element: (
      <ProtectedRoute roles={['cashier', 'manager']}>
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
      { path: 'subscription', element: <OwnerSubscription /> },
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

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  if (!isAuthenticated) return <Navigate to={ROUTES.CUSTOMER.HOME} replace />;
  if (role === 'platformAdmin') return <Navigate to={ROUTES.PLATFORM_ADMIN.DASHBOARD} replace />;
  if (role === 'owner') return <Navigate to={ROUTES.OWNER.DASHBOARD} replace />;
  if (role === 'manager' || role === 'cashier') return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  if (role === 'chef') return <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />;
  if (role === 'customer') return <Navigate to={ROUTES.CUSTOMER.HOME} replace />;
  return <Navigate to={ROUTES.CUSTOMER.HOME} replace />;
}

export default router;
