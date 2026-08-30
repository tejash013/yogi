import { useMemo, useState } from 'react';
import { Card, EmptyState, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { InvoiceTable, InvoiceView, ReceiptView } from '@/components/cashier';
import { formatINR, useCashierStore } from '@/store';
import type { Invoice } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';

export default function Invoices() {
  const invoices = useCashierStore((s) => s.invoices);
  const restaurantInfo = useCashierStore((s) => s.restaurantInfo);
  const [search, setSearch] = useState('');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) => {
      const haystack = [i.invoiceNumber, i.orderNumber, i.customer.name]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [invoices, search]);

  const handleDownload = (inv: Invoice) => {
    const lines = [
      restaurantInfo.name,
      restaurantInfo.address,
      restaurantInfo.phone,
      restaurantInfo.email,
      `GST: ${restaurantInfo.gstNumber}`,
      '------------------------------------',
      `Invoice: ${inv.invoiceNumber}`,
      `Order: ${inv.orderNumber}`,
      `Customer: ${inv.customer.name}`,
      `Phone: ${inv.customer.phone}`,
      `Date: ${new Date(inv.issuedAt).toLocaleString('en-IN')}`,
      '------------------------------------',
      ...inv.items.flatMap((item) => [
        `${item.name} (${item.quantity} x ${formatINR(item.unitPrice)})`,
        `Total: ${formatINR(item.totalPrice)}`,
      ]),
      '------------------------------------',
      `Subtotal: ${formatINR(inv.subtotal)}`,
      `Discount: -${formatINR(inv.discount)}`,
      `Tax: ${formatINR(inv.tax)}`,
      ...(inv.additionalCharges > 0 ? [`Additional Charges: ${formatINR(inv.additionalCharges)}`] : []),
      `Grand Total: ${formatINR(inv.grandTotal)}`,
      `Paid: ${formatINR(inv.paidAmount)}`,
      `Method: ${PAYMENT_METHOD_LABELS[inv.paymentMethod]}`,
      '------------------------------------',
      'Thank you for visiting ' + restaurantInfo.name + '!',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = (inv: Invoice) => {
    setPrintInvoice(inv);
    setTimeout(() => window.print(), 200);
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="View, print and download invoices"
        actions={
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search invoices..."
          />
        }
      />

      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No invoices found" description="Try a different search term." />
          </div>
        ) : (
<InvoiceTable
            invoices={filtered}
            onView={(inv) => setViewInvoice(inv)}
            onPrint={handlePrint}
            onDownload={handleDownload}
          />
        )}
      </Card>

      {/* View invoice modal */}
      <InvoiceView
        invoice={viewInvoice}
        onClose={() => setViewInvoice(null)}
        onPrint={(inv) => {
          setViewInvoice(null);
          setPrintInvoice(inv);
          setTimeout(() => window.print(), 200);
        }}
      />

      {/* Print area */}
      {printInvoice && (
        <div className="hidden print:block">
          <ReceiptView invoice={printInvoice} />
        </div>
      )}
    </div>
  );
}
