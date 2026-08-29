import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { tablesApi } from '@/api';

type TableRow = {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location: string;
  notes?: string;
};

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  occupied: { variant: 'error', label: 'Occupied' },
  reserved: { variant: 'warning', label: 'Reserved' },
  cleaning: { variant: 'info', label: 'Cleaning' },
};

export default function Tables() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true);
      try {
        const response = await tablesApi.getAll().catch(() => ({ data: { data: [] } }));
        const list = Array.isArray(response?.data?.data) ? response.data.data : Array.isArray(response?.data) ? response.data : [];

        const mapped = list.map((table: any, index: number) => {
          const label = String(table?.label ?? table?.number ?? `T${index + 1}`);
          const number = Number.parseInt(label.replace(/\D/g, ''), 10) || index + 1;
          return {
            id: String(table?._id ?? table?.id ?? `table-${index}`),
            number,
            capacity: Number(table?.capacity ?? 0),
            status: (table?.status ?? 'available') as TableRow['status'],
            location: table?.location ?? 'Main hall',
            notes: table?.notes ?? '',
          };
        });

        setTables(mapped);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTables();
  }, []);

  const summary = useMemo(() => ({
    available: tables.filter((table) => table.status === 'available').length,
    occupied: tables.filter((table) => table.status === 'occupied').length,
    reserved: tables.filter((table) => table.status === 'reserved').length,
    cleaning: tables.filter((table) => table.status === 'cleaning').length,
  }), [tables]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tables" description="Manage restaurant table layout" />

      <Card className="overflow-hidden rounded-[30px] border-[#efe4d7] bg-gradient-to-br from-[#fffdfb] to-[#f5efe9] shadow-[0_20px_60px_rgba(85,68,44,0.05)] dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-950">
        <CardHeader className="px-6 pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a57a3f] dark:text-[#f0d7aa]">Table performance</p>
            <h3 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Current floor status</h3>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-4">
          {[
            { label: 'Available', value: summary.available },
            { label: 'Occupied', value: summary.occupied },
            { label: 'Reserved', value: summary.reserved },
            { label: 'Cleaning', value: summary.cleaning },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-[#f0e4d7] bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-[28px] border border-dashed border-[#eadcc7] bg-[#f9f4ee] p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          Loading table status...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => {
            const config = statusConfig[table.status] ?? { variant: 'info', label: 'Available' };
            return (
              <Card key={table.id} className="rounded-[28px] border-[#efe4d7] bg-[#fffdfb] p-5 shadow-[0_18px_50px_rgba(85,68,44,0.05)] dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">Table {table.number}</p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Capacity: {table.capacity} · {table.location}</p>
                  </div>
                  <Badge variant={config.variant} size="sm" className="rounded-full">{config.label}</Badge>
                </div>
                {table.notes ? (
                  <p className="mt-4 rounded-[18px] bg-[#f7f1ea] px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{table.notes}</p>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

