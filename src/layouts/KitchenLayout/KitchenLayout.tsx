import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { KitchenHeader, KitchenSidebar } from '@/components/kitchen';
import { ToastContainer } from '@/components/ui';
import { useToastStore } from '@/store';

/**
 * Main kitchen layout: sticky header + collapsible sidebar + content area.
 * Also renders global toast notifications.
 */
export default function KitchenLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <KitchenHeader onMenuClick={() => setIsSidebarOpen((o) => !o)} />

      <div className="flex flex-1">
        <KitchenSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
