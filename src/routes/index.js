import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { CustomerHome, Menu, FoodDetails, Cart, Checkout, OrderSuccess, OrderTracking, MyOrders, CustomerProfile, Favorites, Rewards, Coupons, Feedback, } from '@/pages/customer';
// Admin Pages
import { AdminDashboard, MenuManagement, AdminCategories, AdminOrders, AdminCustomers, AdminEmployees, AdminTables, AdminInventory, AdminReports, AdminSettings, } from '@/pages/admin';
// Kitchen Pages
import { KitchenDashboard, LiveOrders, Preparing, Ready, Completed, } from '@/pages/kitchen';
// Cashier Pages
import { CashierDashboard, Billing, Payments, Invoices, } from '@/pages/cashier';
// Owner Pages
import { OwnerDashboard, Analytics, Revenue, Expenses, OwnerReports, } from '@/pages/owner';
// Error Pages
import Error403 from '@/pages/errors/Error403';
import ProtectedRoute from '@/components/common/ProtectedRoute';
const router = createBrowserRouter([
    // Root redirect
    {
        path: ROUTES.ROOT,
        element: _jsx(Navigate, { to: ROUTES.DEFAULT, replace: true }),
    },
    // Splash & Welcome
    { path: ROUTES.SPLASH, element: _jsx(SplashScreen, {}) },
    { path: ROUTES.WELCOME, element: _jsx(WelcomeScreen, {}) },
    // Auth routes
    {
        path: '/auth',
        element: _jsx(AuthLayout, {}),
        children: [
            { index: true, element: _jsx(Navigate, { to: ROUTES.AUTH.LOGIN, replace: true }) },
            { path: 'login', element: _jsx(Login, {}) },
            { path: 'register', element: _jsx(Register, {}) },
            { path: 'forgot-password', element: _jsx(ForgotPassword, {}) },
        ],
    },
    // Customer routes
    {
        path: '/customer',
        element: _jsx(CustomerLayout, {}),
        children: [
            { index: true, element: _jsx(Navigate, { to: ROUTES.CUSTOMER.HOME, replace: true }) },
            { path: 'home', element: _jsx(CustomerHome, {}) },
            { path: 'menu', element: _jsx(Menu, {}) },
            { path: 'menu/:id', element: _jsx(FoodDetails, {}) },
            { path: 'cart', element: _jsx(Cart, {}) },
            { path: 'checkout', element: _jsx(Checkout, {}) },
            { path: 'order-success', element: _jsx(OrderSuccess, {}) },
            { path: 'orders', element: _jsx(MyOrders, {}) },
            { path: 'order-tracking/:orderId', element: _jsx(OrderTracking, {}) },
            { path: 'profile', element: _jsx(CustomerProfile, {}) },
            { path: 'favorites', element: _jsx(Favorites, {}) },
            { path: 'rewards', element: _jsx(Rewards, {}) },
            { path: 'coupons', element: _jsx(Coupons, {}) },
            { path: 'feedback', element: _jsx(Feedback, {}) },
        ],
    },
    // Admin routes
    {
        path: '/admin',
        element: (_jsx(ProtectedRoute, { roles: ['admin', 'owner', 'manager'], children: _jsx(AdminLayout, {}) })),
        children: [
            { index: true, element: _jsx(Navigate, { to: ROUTES.ADMIN.DASHBOARD, replace: true }) },
            { path: 'dashboard', element: _jsx(AdminDashboard, {}) },
            { path: 'menu', element: _jsx(MenuManagement, {}) },
            { path: 'categories', element: _jsx(AdminCategories, {}) },
            { path: 'orders', element: _jsx(AdminOrders, {}) },
            { path: 'customers', element: _jsx(AdminCustomers, {}) },
            { path: 'employees', element: _jsx(AdminEmployees, {}) },
            { path: 'tables', element: _jsx(AdminTables, {}) },
            { path: 'inventory', element: _jsx(AdminInventory, {}) },
            { path: 'reports', element: _jsx(AdminReports, {}) },
            { path: 'settings', element: _jsx(AdminSettings, {}) },
        ],
    },
    // Kitchen routes
    {
        path: '/kitchen',
        element: (_jsx(ProtectedRoute, { roles: ['chef', 'admin'], children: _jsx(KitchenLayout, {}) })),
        children: [
            { index: true, element: _jsx(Navigate, { to: ROUTES.KITCHEN.DASHBOARD, replace: true }) },
            { path: 'dashboard', element: _jsx(KitchenDashboard, {}) },
            { path: 'live-orders', element: _jsx(LiveOrders, {}) },
            { path: 'preparing', element: _jsx(Preparing, {}) },
            { path: 'ready', element: _jsx(Ready, {}) },
            { path: 'completed', element: _jsx(Completed, {}) },
        ],
    },
    // Cashier routes
    {
        path: '/cashier',
        element: (_jsx(ProtectedRoute, { roles: ['cashier', 'admin'], children: _jsx(CashierLayout, {}) })),
        children: [
            { index: true, element: _jsx(Navigate, { to: ROUTES.CASHIER.DASHBOARD, replace: true }) },
            { path: 'dashboard', element: _jsx(CashierDashboard, {}) },
            { path: 'billing', element: _jsx(Billing, {}) },
            { path: 'payments', element: _jsx(Payments, {}) },
            { path: 'invoices', element: _jsx(Invoices, {}) },
        ],
    },
    // Owner routes
    {
        path: '/owner',
        element: (_jsx(ProtectedRoute, { roles: ['owner'], children: _jsx(OwnerLayout, {}) })),
        children: [
            { index: true, element: _jsx(Navigate, { to: ROUTES.OWNER.DASHBOARD, replace: true }) },
            { path: 'dashboard', element: _jsx(OwnerDashboard, {}) },
            { path: 'analytics', element: _jsx(Analytics, {}) },
            { path: 'revenue', element: _jsx(Revenue, {}) },
            { path: 'expenses', element: _jsx(Expenses, {}) },
            { path: 'reports', element: _jsx(OwnerReports, {}) },
        ],
    },
    // Error routes
    {
        path: '/error',
        children: [
            { path: '403', element: _jsx(Error403, {}) },
        ],
    },
    // Catch-all
    {
        path: '*',
        element: _jsx(NotFoundPage, {}),
    },
]);
function NotFoundPage() {
    return (_jsx("div", { className: "flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-8xl font-bold text-primary-500", children: "404" }), _jsx("h2", { className: "mt-4 text-2xl font-semibold text-neutral-900 dark:text-white", children: "Page Not Found" }), _jsx("p", { className: "mt-2 text-neutral-500", children: "The page you're looking for doesn't exist." }), _jsx("div", { className: "mt-8", children: _jsx("a", { href: ROUTES.DEFAULT, className: "inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", children: "Go Home" }) })] }) }));
}
export default router;
