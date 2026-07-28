import { Card, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function Ready() {
  return (
    <div>
      <PageHeader title="Ready to Serve" description="Orders ready for pickup" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { order: 'ORD-003', table: 8, items: ['BBQ Wings x1', 'Mango Smoothie x2'], readyAt: '2 min ago' },
          { order: 'ORD-006', table: 1, items: ['Caesar Salad x1'], readyAt: '5 min ago' },
        ].map((order, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white">{order.order}</span>
                <span className="ml-2 text-sm text-neutral-500">Table {order.table}</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <ul className="my-3 space-y-1">
              {order.items.map((item, j) => (
                <li key={j} className="text-sm text-neutral-600 dark:text-neutral-400">{item}</li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Ready {order.readyAt}</span>
              <Button size="sm" variant="secondary">Served</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

