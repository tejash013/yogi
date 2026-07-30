import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const tables = [
  { number: 1, capacity: 2, status: 'available' as const, location: 'Window' },
  { number: 2, capacity: 4, status: 'occupied' as const, location: 'Center' },
  { number: 3, capacity: 4, status: 'occupied' as const, location: 'Center' },
  { number: 4, capacity: 6, status: 'reserved' as const, location: 'VIP' },
  { number: 5, capacity: 2, status: 'available' as const, location: 'Window' },
  { number: 6, capacity: 8, status: 'available' as const, location: 'Corner' },
];

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  occupied: { variant: 'error', label: 'Occupied' },
  reserved: { variant: 'warning', label: 'Reserved' },
  maintenance: { variant: 'info', label: 'Maintenance' },
};

export default function Tables() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tables" description="Manage restaurant table layout" />

      <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Table performance</p>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Current floor status</h3>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          {[
            { label: 'Available', value: 3 },
            { label: 'Occupied', value: 2 },
            { label: 'Reserved', value: 1 },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => {
          const config = statusConfig[table.status];
          return (
            <Card key={table.number} className="rounded-[1.5rem] border-neutral-200 p-5 shadow-soft dark:border-neutral-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-white">Table {table.number}</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Capacity: {table.capacity} · {table.location}</p>
                </div>
                <Badge variant={config.variant} size="sm">{config.label}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

