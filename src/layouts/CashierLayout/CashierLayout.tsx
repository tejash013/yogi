import { Outlet, useNavigate } from 'react-router-dom';
import { CashierHeader } from '@/components/cashier';
import { ToastContainer } from '@/components/ui';
import { useAuthStore, useToastStore } from '@/store';
import { ROUTES } from '@/constants';
import { useOrderAlertSound } from '@/hooks/useOrderAlert';

/**
 * Dedicated cashier layout: top header with integrated navigation & quick bill creation.
 * Full-width layout without left sidebar.
 */
export default function CashierLayout() {
  useOrderAlertSound();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <CashierHeader onLogout={handleLogout} />

      <main className="flex-1 p-2 sm:p-4 lg:p-6">
        <Outlet />
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}


