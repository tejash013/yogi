import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuthStore } from '@/store';

function lazyPage<T extends Record<string, React.ComponentType<any>>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}

const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));
const CustomerLayout = lazy(() => import('@/layouts/CustomerLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const KitchenLayout = lazy(() => import('@/layouts/KitchenLayout'));
const CashierLayout = lazy(() => import('@/layouts/CashierLayout'));
const OwnerLayout = lazy(() => import('@/layouts/OwnerLayout'));
const PlatformAdminLayout = lazy(() => import('@/layouts/PlatformAdminLayout'));

const SplashScreen = lazy(() => import('@/pages/SplashScreen'));
const WelcomeScreen = lazy(() => import('@/pages/WelcomeScreen'));
const Login = lazyPage(() => import('@/pages/auth'), 'Login');
const Register = lazyPage(() => import('@/pages/auth'), 'Register');
const ForgotPassword = lazyPage(() => import('@/pages/auth'), 'ForgotPassword');
const CustomerHome = lazyPage(() => import('@/pages/customer'), 'CustomerHome');
const Menu = lazyPage(() => import('@/pages/customer'), 'Menu');
const FoodDetails = lazyPage(() => import('@/pages/customer'), 'FoodDetails');
const Cart = lazyPage(() => import('@/pages/customer'), 'Cart');
const Checkout = lazyPage(() => import('@/pages/customer'), 'Checkout');
const OrderSuccess = lazyPage(() => import('@/pages/customer'), 'OrderSuccess');
const OrderTracking = lazyPage(() => import('@/pages/customer'), 'OrderTracking');
const MyOrders = lazyPage(() => import('@/pages/customer'), 'MyOrders');
const CustomerProfile = lazyPage(() => import('@/pages/customer'), 'CustomerProfile');
const Favorites = lazyPage(() => import('@/pages/customer'), 'Favorites');
const Rewards = lazyPage(() => import('@/pages/customer'), 'Rewards');
const Coupons = lazyPage(() => import('@/pages/customer'), 'Coupons');
const Feedback = lazyPage(() => import('@/pages/customer'), 'Feedback');
const CustomerTables = lazyPage(() => import('@/pages/customer'), 'CustomerTables');
const AdminDashboard = lazyPage(() => import('@/pages/admin'), 'AdminDashboard');
const MenuManagement = lazyPage(() => import('@/pages/admin'), 'MenuManagement');
const AdminCategories = lazyPage(() => import('@/pages/admin'), 'AdminCategories');
const AdminOrders = lazyPage(() => import('@/pages/admin'), 'AdminOrders');
const AdminCustomers = lazyPage(() => import('@/pages/admin'), 'AdminCustomers');
const AdminEmployees = lazyPage(() => import('@/pages/admin'), 'AdminEmployees');
const AdminTables = lazyPage(() => import('@/pages/admin'), 'AdminTables');
const AdminInventory = lazyPage(() => import('@/pages/admin'), 'AdminInventory');
const AdminReports = lazyPage(() => import('@/pages/admin'), 'AdminReports');
const AdminSettings = lazyPage(() => import('@/pages/admin'), 'AdminSettings');
const AdminUsers = lazyPage(() => import('@/pages/admin'), 'AdminUsers');
const KitchenDashboard = lazyPage(() => import('@/pages/kitchen'), 'KitchenDashboard');
const LiveOrders = lazyPage(() => import('@/pages/kitchen'), 'LiveOrders');
const Preparing = lazyPage(() => import('@/pages/kitchen'), 'Preparing');
const Ready = lazyPage(() => import('@/pages/kitchen'), 'Ready');
const Completed = lazyPage(() => import('@/pages/kitchen'), 'Completed');
const CashierDashboard = lazyPage(() => import('@/pages/cashier'), 'CashierDashboard');
const Billing = lazyPage(() => import('@/pages/cashier'), 'Billing');
const Payments = lazyPage(() => import('@/pages/cashier'), 'Payments');
const Invoices = lazyPage(() => import('@/pages/cashier'), 'Invoices');
const OwnerDashboard = lazyPage(() => import('@/pages/owner'), 'OwnerDashboard');
const Analytics = lazyPage(() => import('@/pages/owner'), 'Analytics');
const Revenue = lazyPage(() => import('@/pages/owner'), 'Revenue');
const Expenses = lazyPage(() => import('@/pages/owner'), 'Expenses');
const OwnerReports = lazyPage(() => import('@/pages/owner'), 'OwnerReports');
const Error403 = lazy(() => import('@/pages/errors/Error403'));
const Workspace = lazyPage(() => import('@/pages/saas'), 'Workspace');

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
      { path: 'tables', element: <CustomerTables /> },
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
      { path: 'preparing', element: <Preparing /> },
      { path: 'ready', element: <Ready /> },
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
  if (!isAuthenticated) return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  if (role === 'platformAdmin') return <Navigate to={ROUTES.PLATFORM_ADMIN.DASHBOARD} replace />;
  if (role === 'owner') return <Navigate to={ROUTES.OWNER.DASHBOARD} replace />;
  if (role === 'manager') return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  if (role === 'chef') return <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />;
  if (role === 'cashier') return <Navigate to={ROUTES.CASHIER.DASHBOARD} replace />;
  if (role === 'customer') return <Navigate to={ROUTES.DEFAULT} replace />;
  return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
}

export default router;
