import { Badge, Button, Table } from '@/components/ui';
import type { Column } from '@/components/ui';
import type { Invoice, InvoiceStatus } from '@/types/cashier';
import { formatINR } from '@/store';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  partially_paid: 'warning',
  cancelled: 'error',
  refunded: 'info',
};

interface Props {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

export default function InvoiceTable({ invoices, onView, onPrint, onDownload }: Props) {
  const columns: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice' },
    { key: 'orderNumber', header: 'Order' },
    { key: 'customer', header: 'Customer', render: (i) => i.customer.name },
    {
      key: 'issuedAt',
      header: 'Date',
      render: (i) => new Date(i.issuedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
    },
    { key: 'grandTotal', header: 'Amount', render: (i) => formatINR(i.grandTotal) },
    {
      key: 'status',
      header: 'Status',
      render: (i) => <Badge variant={statusVariant[i.status]} size="sm">{i.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (i) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(i)}>
            View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onPrint(i)}>
            Print
          </Button>
          {onDownload && (
            <Button size="sm" variant="ghost" onClick={() => onDownload(i)}>
              Download
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={invoices}
      emptyMessage="No invoices found"
      onRowClick={(i) => onView(i)}
    />
  );
}
