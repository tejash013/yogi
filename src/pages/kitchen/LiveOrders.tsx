import { Card, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function LiveOrders() {
  return (
    <div>
      <PageHeader title="Live Orders" description="Real-time incoming orders" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { order: 'ORD-008', table: 4, items: ['Margherita Pizza x2', 'Caesar Salad x1'], time: '2 min ago', status: 'pending' },
          { order: 'ORD-009', table: 7, items: ['Grilled Salmon x1', 'Mango Smoothie x2'], time: '5 min ago', status: 'pending' },
          { order: 'ORD-010', table: 2, items: ['BBQ Wings x1', 'Chocolate Cake x3'], time: '8 min ago', status: 'pending' },
        ].map((order, i) => (
          <Card key={i}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white">{order.order}</span>
                <span className="ml-2 text-sm text-neutral-500">Table {order.table}</span>
              </div>
              <Badge variant="warning" size="sm">New</Badge>
            </div>
            <ul className="mb-3 space-y-1">
              {order.items.map((item, j) => (
                <li key={j} className="text-sm text-neutral-600 dark:text-neutral-400">{item}</li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">{order.time}</span>
              <Button size="sm">Accept & Start</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

