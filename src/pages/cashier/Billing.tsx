import { useState } from 'react';
import { Card, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import {
  BillItem,
  BillSummary,
  CashPayment,
  DiscountSelector,
  OrderList,
  PaymentSelector,
  PaymentSuccess,
  SplitPayment,
  TaxSummary,
} from '@/components/cashier';
import { useCashierStore } from '@/store';
import { ORDER_TYPE_LABELS } from '@/types/cashier';
import { Button } from '@/components/ui';
import { ReceiptView } from '@/components/cashier';
import { useRef } from 'react';

export default function Billing() {
  const orders = useCashierStore((s) => s.orders);
  const currentBill = useCashierStore((s) => s.currentBill);
  const setSelectedOrder = useCashierStore((s) => s.setSelectedOrder);
  const paymentMethod = useCashierStore((s) => s.paymentMethod);
  const completePayment = useCashierStore((s) => s.completePayment);
  const clearCurrentBill = useCashierStore((s) => s.clearCurrentBill);
  const paymentSuccess = useCashierStore((s) => s.paymentSuccess);
  const invoices = useCashierStore((s) => s.invoices);

  const [showSplit, setShowSplit] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleSelectOrder = (id: string) => {
    setSelectedOrder(id);
    setShowSplit(false);
    setShowReceipt(false);
    setShowInvoice(false);
  };

  const handleCompletePayment = () => {
    completePayment();
  };

  const handleNewBill = () => {
    clearCurrentBill();
    setShowSplit(false);
    setShowReceipt(false);
    setShowInvoice(false);
  };

  const successInvoice = paymentSuccess
    ? invoices.find((i) => i.invoiceNumber === paymentSuccess.invoiceNumber) ?? null
    : null;

  const handlePrintReceipt = () => {
    if (successInvoice) {
      setShowReceipt(true);
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Select an order and process its bill"
        actions={
          currentBill && (
            <Button variant="ghost" onClick={handleNewBill}>
              Clear Bill
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Orders / Search */}
        <div>
          <OrderList orders={orders} onSelect={handleSelectOrder} />
        </div>

        {/* Right: Current Bill */}
        <div>
          {!currentBill ? (
            <Card className="flex min-h-[420px] items-center justify-center">
              <EmptyState
                title="Select an order"
                description="Choose an order from the list to build its bill."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Bill header */}
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {currentBill.orderNumber}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {currentBill.customer.name}
                      {currentBill.tableNumber ? ` · Table ${currentBill.tableNumber}` : ''} ·{' '}
                      {ORDER_TYPE_LABELS[currentBill.orderType]}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {currentBill.items.length} items
                  </span>
                </div>
              </Card>

              {/* Items */}
              <Card padding="md">
                <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-white">Items</h3>
                {currentBill.items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-neutral-500">No items in this bill.</p>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {currentBill.items.map((item) => (
                      <BillItem key={`${item.id}-${item.variant ?? ''}`} item={item} />
                    ))}
                  </div>
                )}
              </Card>

              {/* Discount + Tax */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card padding="md">
                  <h3 className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">Discount</h3>
                  <DiscountSelector />
                </Card>
                <Card padding="md">
                  <h3 className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">Tax Breakdown</h3>
                  <TaxSummary />
                </Card>
              </div>

              {/* Summary */}
              <Card padding="md">
                <BillSummary />
              </Card>

              {/* Payment */}
              <Card padding="md">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Payment</h3>
                  <button
                    type="button"
                    onClick={() => setShowSplit((s) => !s)}
                    className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {showSplit ? 'Single Payment' : 'Split Payment'}
                  </button>
                </div>

                {showSplit ? (
                  <SplitPayment />
                ) : (
                  <>
                    <PaymentSelector />
                    {paymentMethod === 'cash' && (
                      <div className="mt-4">
                        <CashPayment />
                      </div>
                    )}
                  </>
                )}

                <div className="mt-4">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleCompletePayment}
                    disabled={currentBill.items.length === 0}
                  >
                    Complete Payment
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success */}
      {paymentSuccess && (
        <PaymentSuccess
          onViewInvoice={() => {
            setShowInvoice(true);
            setShowReceipt(false);
          }}
          onPrintReceipt={handlePrintReceipt}
          onNewBill={handleNewBill}
        />
      )}

      {/* Receipt print area */}
      {showReceipt && successInvoice && (
        <div className="hidden print:block">
          <div ref={printRef}>
            <ReceiptView invoice={successInvoice} />
          </div>
        </div>
      )}

      {/* Invoice view modal */}
      {showInvoice && successInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-neutral-800">
            <ReceiptView invoice={successInvoice} />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInvoice(false)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
