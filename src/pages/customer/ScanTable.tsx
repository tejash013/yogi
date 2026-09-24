import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tablesApi } from '@/api';
import { Loader } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useCartStore, useTenantStore } from '@/store';

export default function ScanTable() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setTenant = useTenantStore((state) => state.setTenant);
  const setTableContext = useCartStore((state) => state.setTableContext);

  useEffect(() => {
    let isCancelled = false;

    async function processScan() {
      if (!token) {
        navigate(ROUTES.CUSTOMER.MENU, { replace: true });
        return;
      }

      const parsed = Number.parseInt(String(token || '').replace(/\D/g, ''), 10);
      const validNum = Number.isFinite(parsed) && parsed > 0 && parsed < 1000 ? parsed : undefined;

      try {
        const response = await tablesApi.resolveQrToken(token);
        const table = response?.data?.data;
        if (table && !isCancelled) {
          const resolvedParsed = Number.parseInt(String(table.label || '').replace(/\D/g, ''), 10);
          const resolvedNum =
            Number.isFinite(resolvedParsed) && resolvedParsed > 0 && resolvedParsed < 1000
              ? resolvedParsed
              : validNum;

          setTableContext({ tableId: table.tableId || token, tableNumber: resolvedNum });

          if (table.restaurantId && table.branchId) {
            await setTenant(String(table.restaurantId), String(table.branchId));
          }

          if (!isCancelled) {
            navigate(
              `${ROUTES.CUSTOMER.MENU}?restaurantId=${encodeURIComponent(String(table.restaurantId))}&branchId=${encodeURIComponent(String(table.branchId))}&table=${encodeURIComponent(String(table.label || resolvedNum || ''))}`,
              { replace: true }
            );
            return;
          }
        }
      } catch (err) {
        console.error('Failed to resolve QR token:', err);
      }

      if (!isCancelled) {
        setTableContext({ tableId: token, tableNumber: validNum });
        navigate(ROUTES.CUSTOMER.MENU, { replace: true });
      }
    }

    void processScan();

    return () => {
      isCancelled = true;
    };
  }, [navigate, setTableContext, setTenant, token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 dark:bg-neutral-900 text-center">
      <div className="flex flex-col items-center gap-3">
        <Loader />
        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200 animate-pulse">
          Opening your table menu...
        </p>
      </div>
    </div>
  );
}