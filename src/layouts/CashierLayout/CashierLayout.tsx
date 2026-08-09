import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CashierHeader, CashierSidebar } from '@/components/cashier';
import { ToastContainer } from '@/components/ui';
import { useToastStore } from '@/store';
import { ROUTES } from '@/constants';

/**
 * Dedicated cashier layout: cashier header + collapsible sidebar.
 * Renders global toast notifications.
 */
export default function CashierLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  const handleLogout = () => {
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <CashierHeader onMenuClick={() => setIsSidebarOpen((o) => !o)} />

      <div className="flex flex-1">
        <CashierSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
