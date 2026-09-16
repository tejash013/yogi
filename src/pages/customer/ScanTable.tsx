import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tablesApi } from '@/api';
import { Button, Card, Loader } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useCartStore, useTenantStore } from '@/store';

export default function ScanTable() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setTenant = useTenantStore((state) => state.setTenant);
  const setTableContext = useCartStore((state) => state.setTableContext);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('This table QR code is invalid.');
      return;
    }
    tablesApi.resolveQrToken(token)
      .then(async (response) => {
        const table = response.data.data;
        await setTenant(table.restaurantId, table.branchId);
        const number = Number.parseInt(table.label.replace(/\D/g, ''), 10);
        setTableContext({ tableId: table.tableId, tableNumber: Number.isFinite(number) ? number : undefined });
        navigate(ROUTES.CUSTOMER.MENU, { replace: true });
      })
      .catch(() => setError('This table QR code is invalid or has been revoked.'));
  }, [navigate, setTableContext, setTenant, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-900">
      <Card className="w-full max-w-md text-center">
        {error ? <><h1 className="text-xl font-bold text-neutral-900 dark:text-white">QR code unavailable</h1><p className="mt-2 text-sm text-neutral-500">{error}</p><Button className="mt-6" onClick={() => navigate(ROUTES.CUSTOMER.HOME)}>Go to restaurant</Button></> : <><Loader /><p className="mt-4 text-sm text-neutral-500">Opening your table menu...</p></>}
      </Card>
    </div>
  );
}