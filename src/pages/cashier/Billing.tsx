import { useState, useEffect, useRef } from 'react';
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
  ReceiptView,
  SplitPayment,
} from '@/components/cashier';
import { formatINR, useCashierStore } from '@/store';
import { menuApi, categoriesApi, tablesApi } from '@/api';
import type { MenuItem, Category } from '@/types';
import {
  FiPlus,
  FiShoppingBag,
  FiList,
  FiSearch,
  FiMinus,
  FiTrash2,
  FiMoreVertical,
  FiCheckCircle,
} from 'react-icons/fi';

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('shake') || lower.includes('juice')) return '🥤';
  if (lower.includes('coffee') || lower.includes('tea')) return '☕';
  if (lower.includes('extra') || lower.includes('side') || lower.includes('snack')) return '🍿';
  if (lower.includes('dessert') || lower.includes('ice cream') || lower.includes('sweet')) return '🍦';
  if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('chinese')) return '🍜';
  if (lower.includes('main') || lower.includes('thali') || lower.includes('dish')) return '🍛';
  return '🍽️';
}

export default function Billing() {
  const orders = useCashierStore((s) => s.orders);
  const currentBill = useCashierStore((s) => s.currentBill);
  const setSelectedOrder = useCashierStore((s) => s.setSelectedOrder);
  const createNewBill = useCashierStore((s) => s.createNewBill);
  const updateBillInfo = useCashierStore((s) => s.updateBillInfo);
  const addBillItem = useCashierStore((s) => s.addBillItem);
  const updateQuantity = useCashierStore((s) => s.updateQuantity);
  const paymentMethod = useCashierStore((s) => s.paymentMethod);
  const setPaymentMethod = useCashierStore((s) => s.setPaymentMethod);
  const completePayment = useCashierStore((s) => s.completePayment);
  const sendOrderToKitchen = useCashierStore((s) => s.sendOrderToKitchen);
  const clearCurrentBill = useCashierStore((s) => s.clearCurrentBill);
  const paymentSuccess = useCashierStore((s) => s.paymentSuccess);
  const invoices = useCashierStore((s) => s.invoices);
  const calculateTotals = useCashierStore((s) => s.calculateTotals);

  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const [showSplit, setShowSplit] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [tables, setTables] = useState<Array<{ id: string; label: string }>>([]);
  const [showCartMenu, setShowCartMenu] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleReset = () => {
      createNewBill();
    };
    window.addEventListener('reset-pos-cart', handleReset);
    return () => window.removeEventListener('reset-pos-cart', handleReset);
  }, [createNewBill]);

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
          image: it.image ?? '/images/placeholder.jpg',
          images: [],
          ingredients: [],
          allergens: [],
          nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          isAvailable: it.isActive ?? true,
          isPopular: Boolean(it.isPopular),
          isRecommended: Boolean(it.isRecommended),
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

  // Item quantity map in current active bill
  const itemQtyMap = new Map<string, number>();
  if (currentBill) {
    for (const bi of currentBill.items) {
      itemQtyMap.set(bi.id, (itemQtyMap.get(bi.id) || 0) + bi.quantity);
    }
  }

  const handleQuantityChange = (item: MenuItem, delta: number) => {
    let bill = useCashierStore.getState().currentBill;
    if (!bill) {
      if (delta > 0) {
        createNewBill();
        bill = useCashierStore.getState().currentBill;
      } else {
        return;
      }
    }

    const currentQty = itemQtyMap.get(item.id) || 0;
    if (currentQty > 0) {
      updateQuantity(item.id, delta);
    } else if (delta > 0) {
      addBillItem({
        id: item.id,
        name: item.name,
        image: item.image,
        addons: [],
        quantity: 1,
        unitPrice: item.discountPrice || item.price,
        totalPrice: item.discountPrice || item.price,
      });
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

  const popularItems = menuItems.filter((it) => it.isPopular).slice(0, 4);
  const featuredItems = menuItems.filter((it) => it.isRecommended).slice(0, 4);

  const bestSellingList = popularItems.length > 0 ? popularItems : menuItems.slice(0, 4);
  const featuredList = featuredItems.length > 0 ? featuredItems : menuItems.slice(4, 6);

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      {/* Top Page Header & Main Controls */}
      <PageHeader
        title="POS Terminal Billing"
        description="Touchscreen Billing & Instant Order Checkout"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TenantSelector variant="pill" />
            <Button variant="primary" onClick={handleNewBill} className="shadow-md font-bold">
              <FiPlus className="mr-1.5 h-4 w-4" /> + New POS Bill
            </Button>
            {currentBill && (
              <Button variant="outline" onClick={() => clearCurrentBill()} className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                <FiTrash2 className="mr-1.5 h-3.5 w-3.5" /> Clear Bill
              </Button>
            )}
          </div>
        }
      />

      {/* Main View Switcher & Top Header Category Navigation Bar */}
      <div className="space-y-3">
        {/* Navigation Mode Switcher: POS Catalog vs Kitchen Orders */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-200/80 p-1.5 dark:bg-neutral-800">
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-white text-neutral-900 shadow-md dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <FiShoppingBag className="h-4 w-4 text-primary-500" /> POS Menu Catalog ({menuItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-neutral-900 shadow-md dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <FiList className="h-4 w-4 text-primary-500" /> Active Orders ({orders.length})
            </button>
          </div>
        </div>

        {/* TOP HEADER CATEGORY LIST BAR (Replaces left-side bar with Header Category Bar) */}
        {activeTab === 'menu' && (
          <Card padding="sm" className="bg-white/90 dark:bg-neutral-850/90 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Horizontal Bar */}
              <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setSelectedCat('all')}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                    selectedCat === 'all'
                      ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200/80 hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-750'
                  }`}
                >
                  <span>🍽️</span>
                  <span>All Categories</span>
                </button>
                {categories.map((c) => {
                  const icon = getCategoryIcon(c.name);
                  const isSelected = selectedCat === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCat(c.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200/80 hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-750'
                      }`}
                    >
                      <span className="text-base">{icon}</span>
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Header Search Field */}
              <div className="relative shrink-0 sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Main Terminal Grid & Cart Panel */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: POS Item Selection & Quick Order Chips */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'orders' ? (
            <OrderList orders={orders} onSelect={handleSelectOrder} />
          ) : (
            <div className="space-y-4">
              {/* Best Selling Items & Featured Items Row */}
              {(bestSellingList.length > 0 || featuredList.length > 0) && !menuSearch && selectedCat === 'all' && (
                <Card padding="md" className="space-y-3 bg-neutral-50/70 dark:bg-neutral-850/60 border-neutral-200/80 dark:border-neutral-800">
                  {bestSellingList.length > 0 && (
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">
                        🔥 Best Selling Items
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {bestSellingList.map((item) => {
                          const qty = itemQtyMap.get(item.id) || 0;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleQuantityChange(item, 1)}
                              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                                qty > 0
                                  ? 'border-rose-500 bg-rose-500/10 text-neutral-900 dark:text-white font-bold ring-1 ring-rose-500'
                                  : 'border-neutral-200 bg-white hover:border-rose-400 dark:border-neutral-700 dark:bg-neutral-800'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold">{item.name}</p>
                                <p className="text-[11px] font-extrabold text-primary-500">{formatINR(item.discountPrice || item.price)}</p>
                              </div>
                              {qty > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                                  {qty}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {featuredList.length > 0 && (
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                        ⭐ Featured Items
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {featuredList.map((item) => {
                          const qty = itemQtyMap.get(item.id) || 0;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleQuantityChange(item, 1)}
                              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                                qty > 0
                                  ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white font-bold ring-1 ring-amber-500'
                                  : 'border-neutral-200 bg-white hover:border-amber-400 dark:border-neutral-700 dark:bg-neutral-800'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold">{item.name}</p>
                                <p className="text-[11px] font-extrabold text-primary-500">{formatINR(item.discountPrice || item.price)}</p>
                              </div>
                              {qty > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                                  {qty}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Main Dish Items Grid */}
              <div className="max-h-[620px] overflow-y-auto pr-1">
                {filteredMenuItems.length === 0 ? (
                  <Card className="py-16 text-center text-sm text-neutral-500">
                    <p>No dishes found for this category or search.</p>
                  </Card>
                ) : (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredMenuItems.map((item) => {
                      const qty = itemQtyMap.get(item.id) || 0;
                      const isSelected = qty > 0;

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col justify-between rounded-2xl border p-3 transition-all duration-200 ${
                            isSelected
                              ? 'border-red-500 bg-red-500/5 dark:bg-red-950/20 shadow-md ring-2 ring-red-500/30'
                              : 'border-neutral-200 bg-white hover:border-primary-400 dark:border-neutral-800 dark:bg-neutral-850 dark:hover:border-primary-600'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-neutral-900 dark:text-white line-clamp-2 min-h-[32px]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm font-black text-primary-600 dark:text-primary-400">
                              ₹{(item.discountPrice || item.price).toFixed(2)}
                            </p>
                          </div>

                          {/* Stepper Controls on Card */}
                          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={qty === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-200 disabled:opacity-30 dark:bg-neutral-700 dark:text-white"
                            >
                              <FiMinus className="h-3.5 w-3.5" />
                            </button>
                            <span className={`w-6 text-center text-sm font-black ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm transition hover:bg-red-600 active:scale-95"
                            >
                              <FiPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: POS Cart & Payment Panel */}
        <div className="lg:col-span-5">
          {!currentBill ? (
            <Card className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center">
              <EmptyState
                title="Cart is Empty"
                description="Tap any dish from the menu catalog or start a new bill to begin."
              />
              <Button className="mt-4 font-bold shadow-md" onClick={handleNewBill}>
                <FiPlus className="mr-1.5 h-4 w-4" /> Start New POS Bill
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Cart Items Header Panel */}
              <Card padding="md" className="space-y-3 shadow-soft">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-neutral-900 dark:text-white">Cart</h3>
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-extrabold text-red-600 dark:bg-red-950/50 dark:text-red-300">
                      {currentBill.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCartMenu(!showCartMenu)}
                      className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <FiMoreVertical className="h-5 w-5" />
                    </button>

                    {showCartMenu && (
                      <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                        <button
                          type="button"
                          onClick={() => {
                            clearCurrentBill();
                            setShowCartMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <FiTrash2 className="h-4 w-4" /> Clear All Items
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleNewBill();
                            setShowCartMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                          <FiPlus className="h-4 w-4" /> Start New Bill
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table & Customer Order Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Order Type</label>
                    <select
                      value={currentBill.orderType}
                      onChange={(e) => updateBillInfo({ orderType: e.target.value as any })}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                      <option value="dine-in">🍽️ Dine In</option>
                      <option value="takeaway">🛍️ Takeaway</option>
                      <option value="delivery">🚚 Delivery</option>
                    </select>
                  </div>

                  {currentBill.orderType === 'dine-in' ? (
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Table</label>
                      <select
                        value={currentBill.tableId ?? ''}
                        onChange={(e) => {
                          const selected = tables.find((table) => table.id === e.target.value);
                          updateBillInfo({
                            tableId: e.target.value,
                            tableNumber: selected?.label.replace(/\D/g, '') || selected?.label || '',
                          });
                        }}
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      >
                        <option value="">Select table</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Customer Name</label>
                      <Input
                        type="text"
                        placeholder="Customer name"
                        value={currentBill.customer.name}
                        onChange={(e) => updateBillInfo({ customerName: e.target.value })}
                        className="py-1 text-xs font-semibold"
                      />
                    </div>
                  )}
                </div>

                {/* Cart Line Items List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1 dark:divide-neutral-800">
                  {currentBill.items.length === 0 ? (
                    <p className="py-6 text-center text-xs text-neutral-400">Cart is empty. Select items to add.</p>
                  ) : (
                    currentBill.items.map((item) => (
                      <BillItem key={`${item.id}-${item.variant ?? ''}`} item={item} />
                    ))
                  )}
                </div>

                {/* Cart Totals Summary */}
                <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Total amount</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      ₹{totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Discount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      -₹{totals.discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Tax</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      ₹{totals.taxAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2 dark:border-neutral-700">
                    <span className="text-base font-black text-neutral-900 dark:text-white">Grand Total</span>
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">
                      ₹{totals.grandTotal.toFixed(0)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Discounts & Payment Selection */}
              <Card padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                    Quick Payment Options
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSplit(!showSplit)}
                    className="text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {showSplit ? 'Single Mode' : 'Split Pay'}
                  </button>
                </div>

                {showSplit ? (
                  <SplitPayment />
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    {[
                      { id: 'cash', label: '💵 Cash' },
                      { id: 'card', label: '💳 Card' },
                      { id: 'upi', label: '📱 Wallet / UPI' },
                      { id: 'netbanking', label: '💵💳 Cash & Card' },
                      { id: 'other', label: '🎁 Non chargeable' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`rounded-xl p-2 text-center text-xs font-bold transition-all border ${
                          paymentMethod === pm.id
                            ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Submit Order Action Buttons */}
                <div className="space-y-2 pt-2">
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
                    className="font-bold shadow-md bg-red-600 hover:bg-red-700 text-white"
                  >
                    <FiCheckCircle className="mr-1.5 h-4 w-4" /> Complete Payment & Print Invoice
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
