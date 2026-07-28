import { useState } from 'react';
import { Button, Card, Input, Select, Table } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface BillingItem {
  item: string;
  qty: number;
  price: number;
  total: number;
}

export default function Billing() {
  const [items] = useState<BillingItem[]>([
    { item: 'Margherita Pizza', qty: 2, price: 12.99, total: 25.98 },
    { item: 'Caesar Salad', qty: 1, price: 9.99, total: 9.99 },
  ]);

  const columns: Column<BillingItem>[] = [
    { key: 'item', header: 'Item' },
    { key: 'qty', header: 'Qty' },
    { key: 'price', header: 'Price', render: (item) => `$${item.price.toFixed(2)}` },
    { key: 'total', header: 'Total', render: (item) => `$${item.total.toFixed(2)}` },
  ];

  return (
    <div>
      <PageHeader title="Billing" description="Create and manage bills" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Order Items</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input placeholder="Search menu items..." className="flex-1" />
                <Select
                  options={[
                    { value: '1', label: 'Table 1' },
                    { value: '2', label: 'Table 2' },
                    { value: '3', label: 'Table 3' },
                  ]}
                  placeholder="Select table"
                />
              </div>
              <Table columns={columns} data={items} />
              <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <div className="space-y-1 text-right">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-medium">$35.97</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Tax (8%)</span>
                    <span className="font-medium">$2.88</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-500">$38.85</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Payment</h3>
            <div className="space-y-4">
              <Select
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Card' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'online', label: 'Online' },
                ]}
                placeholder="Payment method"
                label="Payment Method"
              />
              <Input label="Amount Received" type="number" placeholder="0.00" />
              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                <p className="text-sm text-green-700 dark:text-green-300">Change Due</p>
                <p className="text-2xl font-bold text-green-600">$0.00</p>
              </div>
              <Button fullWidth size="lg">Process Payment</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
