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
    if (!token) {
      navigate(ROUTES.CUSTOMER.HOME, { replace: true });
      return;
    }

    const parsed = Number.parseInt(String(token || '').replace(/\D/g, ''), 10);
    const validNum = Number.isFinite(parsed) && parsed > 0 && parsed < 1000 ? parsed : undefined;

    // Immediately set table context for instant webapp entry without waiting on network delays
    setTableContext({ tableId: token, tableNumber: validNum });

    // Background tenant metadata resolution
    tablesApi
      .resolveQrToken(token)
      .then((response) => {
        const table = response?.data?.data;
        if (table) {
          void setTenant(table.restaurantId, table.branchId);
          const resolvedParsed = Number.parseInt(String(table.label || '').replace(/\D/g, ''), 10);
          const resolvedNum =
            Number.isFinite(resolvedParsed) && resolvedParsed > 0 && resolvedParsed < 1000
              ? resolvedParsed
              : validNum;
          setTableContext({ tableId: table.tableId || token, tableNumber: resolvedNum });
        }
      })
      .catch(() => {})
      .finally(() => {
        navigate(ROUTES.CUSTOMER.HOME, { replace: true });
      });
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