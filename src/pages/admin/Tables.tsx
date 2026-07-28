import { Card, Badge } from '@/components/ui';
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
    <div>
      <PageHeader title="Tables" description="Manage restaurant table layout" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => {
          const config = statusConfig[table.status];
          return (
            <Card key={table.number} hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    Table {table.number}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Capacity: {table.capacity} • {table.location}
                  </p>
                </div>
                <Badge variant={config.variant} size="sm">
                  {config.label}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

