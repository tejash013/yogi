import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function Completed() {
  return (
    <div>
      <PageHeader title="Completed Orders" description="Orders that have been served" />

      <Card>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {[
            { order: 'ORD-002', table: 3, items: 2, total: 41.41, completedAt: '7:15 PM' },
            { order: 'ORD-005', table: 6, items: 3, total: 28.50, completedAt: '6:45 PM' },
            { order: 'ORD-011', table: 2, items: 1, total: 12.99, completedAt: '6:30 PM' },
          ].map((order, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-white">{order.order}</span>
                  <Badge variant="success" size="sm">Completed</Badge>
                </div>
                <p className="text-sm text-neutral-500">Table {order.table} • {order.items} items</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900 dark:text-white">${order.total.toFixed(2)}</p>
                <p className="text-sm text-neutral-500">{order.completedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

