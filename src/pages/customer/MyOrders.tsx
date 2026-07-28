import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { OrderCard } from '@/components/customer';
import { ROUTES } from '@/constants';
import type { Order } from '@/types';
import ordersData from '@/data/orders.json';

const orders = ordersData as Order[];

export default function MyOrders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'current' | 'previous'>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filter === 'all' ||
      (filter === 'current' && !['completed', 'cancelled'].includes(order.status)) ||
      (filter === 'previous' && ['completed', 'cancelled'].includes(order.status));
    return matchesSearch && matchesFilter;
  });

  const handleRepeatOrder = (order: Order) => {
    alert(`Repeating order ${order.orderNumber} - items added to cart!`);
  };

  const handleInvoice = (order: Order) => {
    alert(`Invoice for ${order.orderNumber} generated!`);
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
          <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">No orders yet</h2>
        <p className="mb-6 text-sm text-neutral-500">Your order history will appear here</p>
        <Link to={ROUTES.CUSTOMER.MENU}>
          <Button size="lg">Start Ordering</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">My Orders</h1>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'current', 'previous'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'current' && ` (${orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length})`}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="mb-3 text-4xl">📋</span>
          <p className="text-sm text-neutral-500">No orders match your search</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              orderNumber={order.orderNumber}
              status={order.status}
              items={order.items.map((i) => ({ name: i.name, quantity: i.quantity }))}
              total={order.total}
              createdAt={order.createdAt}
              isCurrent={!['completed', 'cancelled'].includes(order.status)}
              onRepeatOrder={() => handleRepeatOrder(order)}
              onInvoice={() => handleInvoice(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

