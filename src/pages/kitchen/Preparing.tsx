import { Card, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function Preparing() {
  return (
    <div>
      <PageHeader title="Preparing" description="Orders currently being prepared" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { order: 'ORD-001', table: 5, items: ['Margherita Pizza x1', 'Caesar Salad x1'], time: 'Started 5 min ago', eta: '10 min' },
          { order: 'ORD-004', table: 3, items: ['Grilled Salmon x1', 'Chocolate Cake x1'], time: 'Started 12 min ago', eta: '8 min' },
        ].map((order, i) => (
          <Card key={i}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-neutral-900 dark:text-white">{order.order}</span>
              <span className="text-sm text-neutral-500">Table {order.table}</span>
            </div>
            <ul className="mb-3 space-y-1">
              {order.items.map((item, j) => (
                <li key={j} className="text-sm text-neutral-600 dark:text-neutral-400">{item}</li>
              ))}
            </ul>
            <div className="mb-3 text-sm text-neutral-500">{order.time}</div>
            <div className="flex items-center justify-between">
              <Badge variant="primary">ETA: {order.eta}</Badge>
              <Button size="sm" variant="secondary">Mark Ready</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

