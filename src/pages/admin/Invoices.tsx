import { useEffect, useMemo, useState } from 'react';
import { invoicesApi } from '@/api';
import { Badge, Button, Card, EmptyState, Loader, Search, Table } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { useOrderSyncStore, useTenantStore } from '@/store';
import type { Column } from '@/components/ui';

type ManagerInvoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  issuedAt: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

const normalizeInvoice = (invoice: any): ManagerInvoice => {
  const id = String(invoice?._id ?? invoice?.id ?? '');
  return {
    id,
    invoiceNumber: `INV-${id.slice(-6).toUpperCase()}`,
    orderId: String(invoice?.order?._id ?? invoice?.order ?? 'Unknown order'),
    amount: Number(invoice?.amount ?? 0),
    status: String(invoice?.status ?? 'pending'),
    paymentMethod: String(invoice?.paymentMethod ?? 'Not specified'),
    issuedAt: invoice?.issuedAt ?? invoice?.createdAt ?? new Date().toISOString(),
  };
};

export default function AdminInvoices() {
  const { branchId } = useTenantStore();
  const syncVersion = useOrderSyncStore((state) => state.version);
  const [invoices, setInvoices] = useState<ManagerInvoice[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    invoicesApi
      .getAll({ page: 1, limit: 100 })
      .then((response) => {
        if (!active) return;
        const list = Array.isArray(response.data?.data) ? response.data.data : [];
        setInvoices(list.map(normalizeInvoice));
      })
      .catch(() => {
        if (active) setInvoices([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [branchId, refreshCount, syncVersion]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) =>
      [invoice.invoiceNumber, invoice.orderId, invoice.status, invoice.paymentMethod]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [invoices, search]);

  const columns: Column<ManagerInvoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice' },
    { key: 'orderId', header: 'Order' },
    { key: 'amount', header: 'Amount', render: (invoice) => formatCurrency(invoice.amount) },
    {
      key: 'status',
      header: 'Status',
      render: (invoice) => (
        <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'cancelled' ? 'error' : 'warning'} size="sm">
          {invoice.status}
        </Badge>
      ),
    },
    { key: 'paymentMethod', header: 'Payment' },
    {
      key: 'issuedAt',
      header: 'Issued',
      render: (invoice) => new Date(invoice.issuedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Review invoices created by the cashier and payment workflows."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TenantSelector variant="pill" />
            <Search value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search invoices..." />
            <Button variant="outline" onClick={() => setRefreshCount((count) => count + 1)}>Refresh</Button>
          </div>
        }
      />

      <Card padding="none">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader /></div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-6"><EmptyState title="No invoices found" description="Created invoices will appear here after they are saved." /></div>
        ) : (
          <Table columns={columns} data={filteredInvoices} emptyMessage="No invoices found" />
        )}
      </Card>
    </div>
  );
}
