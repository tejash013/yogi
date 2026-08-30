import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, Table, Search, Badge, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';
import { ordersApi, usersApi } from '@/api';
import { formatCurrency } from '@/utils';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  role: string;
}

const columns: Column<CustomerRow>[] = [
  { key: 'name', header: 'Name', render: (item) => <span className="font-semibold text-neutral-900 dark:text-white">{item.name}</span> },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone', render: (item) => item.phone || '—' },
  { key: 'orders', header: 'Total Orders', render: (item) => <Badge variant="primary" size="sm">{item.orders}</Badge> },
  { key: 'spent', header: 'Total Spent', render: (item) => <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(item.spent)}</span> },
];

export default function Customers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const [usersRes, ordersRes] = await Promise.all([
          usersApi.getAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
          ordersApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

        const rawUsers = Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [];
        const rawOrders = Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : [];

        setUsers(rawUsers);
        setOrders(rawOrders);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCustomers();
  }, []);

  // Compute spend and orders per user
  const customerRows: CustomerRow[] = useMemo(() => {
    return users.map((u: any) => {
      const uId = String(u._id || u.id);
      const userOrders = orders.filter((o: any) => {
        const orderUid = String(o.user?._id || o.user || o.userId || '');
        return orderUid === uId;
      });

      const totalSpent = userOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      return {
        id: uId,
        name: u.name || 'Anonymous User',
        email: u.email || '—',
        phone: u.phone || '',
        orders: userOrders.length,
        spent: totalSpent,
        role: u.role || 'customer',
      };
    });
  }, [users, orders]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customerRows;
    return customerRows.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  }, [customerRows, search]);

  const totalSpentAll = useMemo(() => {
    return customerRows.reduce((sum, c) => sum + c.spent, 0);
  }, [customerRows]);

  const avgSpend = customerRows.length > 0 ? totalSpentAll / customerRows.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="View your registered customer base and their live purchase activity"
        actions={<Search placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
          <CardHeader>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer insights</p>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Loyalty and orders</h3>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total customers</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">
                {isLoading ? '...' : customerRows.length}
              </p>
            </div>
            <div className="rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Average spend</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">
                {isLoading ? '...' : formatCurrency(avgSpend)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer engagement</p>
          <div className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            <p>Customer accounts are synchronized with the multi-tenant database.</p>
            <p>Personalized rewards and coupons are computed dynamically from active order receipts.</p>
          </div>
        </Card>
      </div>

      <Card padding="none">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState title="No customers found" description="Registered customers will appear here." />
          </div>
        ) : (
          <Table columns={columns} data={filteredCustomers} />
        )}
      </Card>
    </div>
  );
}
