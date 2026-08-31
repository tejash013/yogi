import { useState, useEffect } from 'react';
import { Card, EmptyState, Button, Input } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
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
import { formatINR, useCashierStore } from '@/store';
import { ReceiptView } from '@/components/cashier';
import { useRef } from 'react';
import { menuApi, categoriesApi, tablesApi } from '@/api';
import type { MenuItem, Category } from '@/types';
import { FiPlus, FiShoppingBag, FiList, FiSearch } from 'react-icons/fi';

export default function Billing() {
  const orders = useCashierStore((s) => s.orders);
  const currentBill = useCashierStore((s) => s.currentBill);
  const setSelectedOrder = useCashierStore((s) => s.setSelectedOrder);
  const createNewBill = useCashierStore((s) => s.createNewBill);
  const updateBillInfo = useCashierStore((s) => s.updateBillInfo);
  const addBillItem = useCashierStore((s) => s.addBillItem);
  const paymentMethod = useCashierStore((s) => s.paymentMethod);
  const completePayment = useCashierStore((s) => s.completePayment);
  const sendOrderToKitchen = useCashierStore((s) => s.sendOrderToKitchen);
  const clearCurrentBill = useCashierStore((s) => s.clearCurrentBill);
  const paymentSuccess = useCashierStore((s) => s.paymentSuccess);
  const invoices = useCashierStore((s) => s.invoices);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [showSplit, setShowSplit] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [tables, setTables] = useState<Array<{ id: string; label: string }>>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      menuApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
      categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
    ]).then(([mRes, cRes]) => {
      const items = Array.isArray(mRes?.data?.data) ? mRes.data.data : Array.isArray(mRes?.data) ? mRes.data : [];
      const cats = Array.isArray(cRes?.data?.data) ? cRes.data.data : Array.isArray(cRes?.data) ? cRes.data : [];
      setMenuItems(
        items.map((it: any) => ({
          id: String(it._id ?? it.id ?? ''),
          name: it.title ?? it.name ?? 'Item',
          description: it.description ?? '',
          price: Number(it.price ?? 0),
          discountPrice: it.discountPrice ? Number(it.discountPrice) : undefined,
          categoryId: String(it.category?._id ?? it.categoryId ?? it.category ?? ''),
          categoryName: it.categoryName ?? it.category?.name ?? 'General',
          availableQty: Number(it.availableQty ?? 20),
          image: it.image ?? '/images/placeholder.jpg',
          images: [],
          ingredients: [],
          allergens: [],
          nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          isAvailable: it.isActive ?? true,
          isPopular: false,
          isRecommended: false,
          preparationTime: 15,
          rating: 4.5,
          totalReviews: 10,
          tags: it.tags ?? [],
          createdAt: new Date().toISOString(),
        }))
      );
      setCategories(cats);
    });
  }, []);

  useEffect(() => {
    tablesApi.getAll()
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setTables(list.map((table: any) => ({
          id: String(table._id ?? table.id),
          label: String(table.label ?? table.number ?? 'Table'),
        })));
      })
      .catch(() => setTables([]));
  }, []);

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
    createNewBill();
    setActiveTab('menu');
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

  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedCat !== 'all' && item.categoryId !== selectedCat) return false;
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Billing & Invoicing"
        description="Create walk-in bills or settle customer orders"
        actions={
          <div className="flex items-center gap-2">
            <TenantSelector variant="pill" />
            <Button variant="primary" onClick={handleNewBill}>
              <FiPlus className="mr-1.5 h-4 w-4" /> New POS Bill
            </Button>
            {currentBill && (
              <Button variant="outline" onClick={() => clearCurrentBill()}>
                Clear Bill
              </Button>
            )}
          </div>
        }
      />

      <TenantSelector variant="banner" showDetails={true} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column (Tabs for Active Orders vs Menu Catalog) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex rounded-xl bg-neutral-200/80 p-1 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <FiList className="h-4 w-4" /> Active Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <FiShoppingBag className="h-4 w-4" /> Add Menu Items ({menuItems.length})
            </button>
          </div>

          {activeTab === 'orders' ? (
            <OrderList orders={orders} onSelect={handleSelectOrder} />
          ) : (
            <Card padding="md" className="space-y-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search dishes to add to bill..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>

              {categories.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setSelectedCat('all')}
                    className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold transition ${
                      selectedCat === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCat(c.id)}
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold transition ${
                        selectedCat === c.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
                {filteredMenuItems.length === 0 ? (
                  <p className="py-8 text-center text-xs text-neutral-500">No menu items found.</p>
                ) : (
                  filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-2.5 transition hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                          {formatINR(item.discountPrice || item.price)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          addBillItem({
                            id: item.id,
                            name: item.name,
                            image: item.image,
                            addons: [],
                            quantity: 1,
                            unitPrice: item.discountPrice || item.price,
                            totalPrice: item.discountPrice || item.price,
                          })
                        }
                      >
                        <FiPlus className="h-3.5 w-3.5 mr-1" /> Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: Active Bill Details */}
        <div className="lg:col-span-7">
          {!currentBill ? (
            <Card className="flex min-h-[460px] flex-col items-center justify-center p-8 text-center">
              <EmptyState
                title="No Active Bill Selected"
                description="Select an order from the list or create a new POS bill to get started."
              />
              <Button className="mt-4" onClick={handleNewBill}>
                <FiPlus className="mr-1.5 h-4 w-4" /> Create New Bill
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Bill Details Header with Table & Customer info */}
              <Card padding="md">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3 dark:border-neutral-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-neutral-900 dark:text-white">
                        {currentBill.orderNumber}
                      </span>
                      <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        {currentBill.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Created: {new Date(currentBill.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={currentBill.orderType}
                      onChange={(e) =>
                        updateBillInfo({ orderType: e.target.value as any })
                      }
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <option value="dine-in">🍽️ Dine In</option>
                      <option value="takeaway">🛍️ Takeaway</option>
                      <option value="delivery">🚚 Delivery</option>
                    </select>
                  </div>
                </div>

                {/* Table Number and Customer Name Inputs */}
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {currentBill.orderType === 'dine-in' && (
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500">Database Table</label>
                      <select
                        value={currentBill.tableId ?? ''}
                        onChange={(e) => {
                          const selected = tables.find((table) => table.id === e.target.value);
                          updateBillInfo({
                            tableId: e.target.value,
                            tableNumber: selected?.label.replace(/\D/g, '') || selected?.label || '',
                          });
                        }}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-800"
                      >
                        <option value="">Select table</option>
                        {tables.map((table) => <option key={table.id} value={table.id}>{table.label}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500">Customer Name</label>
                    <Input
                      type="text"
                      placeholder="Walk-in / Name"
                      value={currentBill.customer.name}
                      onChange={(e) => updateBillInfo({ customerName: e.target.value })}
                      className="py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500">Phone (optional)</label>
                    <Input
                      type="text"
                      placeholder="Mobile number"
                      value={currentBill.customer.phone ?? ''}
                      onChange={(e) => updateBillInfo({ customerPhone: e.target.value })}
                      className="py-1 text-xs"
                    />
                  </div>
                </div>
              </Card>

              {/* Items in Bill */}
              <Card padding="md">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Bill Items</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add more dishes
                  </button>
                </div>
                {currentBill.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                    <p>No items added yet.</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveTab('menu')}>
                      Browse Menu Catalog
                    </Button>
                  </div>
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
                  <h3 className="mb-3 text-sm font-bold text-neutral-900 dark:text-white">Discounts & Coupons</h3>
                  <DiscountSelector />
                </Card>
                <Card padding="md">
                  <h3 className="mb-3 text-sm font-bold text-neutral-900 dark:text-white">Tax & GST Breakdown</h3>
                  <TaxSummary />
                </Card>
              </div>

              {/* Summary */}
              <Card padding="md">
                <BillSummary />
              </Card>

              {/* Payment Section */}
              <Card padding="md">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Payment Method</h3>
                  <button
                    type="button"
                    onClick={() => setShowSplit((s) => !s)}
                    className="text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
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

                <div className="mt-5 space-y-2">
                  {currentBill.id.startsWith('pos-') && (
                    <Button
                      fullWidth
                      variant="outline"
                      size="md"
                      onClick={() => void sendOrderToKitchen()}
                      disabled={currentBill.items.length === 0}
                      className="border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 font-bold"
                    >
                      🔥 Send to Kitchen (Save Order in DB)
                    </Button>
                  )}
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleCompletePayment}
                    disabled={currentBill.items.length === 0}
                  >
                    Complete Payment & Print Invoice
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Modal */}
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

      {/* Hidden Receipt print area */}
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
