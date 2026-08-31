import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import RestaurantFloorView, { type TableItem } from '@/components/common/RestaurantFloorView';
import { tablesApi } from '@/api';
import { ROUTES } from '@/constants';
import { useCartStore, useTenantStore } from '@/store';

export default function CustomerTables() {
  const navigate = useNavigate();
  const { branchId, currentBranch } = useTenantStore();
  const activeTableNumber = useCartStore((s) => s.tableNumber);
  const setTableNumber = useCartStore((s) => s.setTableNumber);

  const [tables, setTables] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'floor' | 'grid'>('floor');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTables = async () => {
    setIsLoading(true);
    try {
      const response = await tablesApi.getAll().catch(() => ({ data: { data: [] } }));
      const list = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const mapped: TableItem[] = list.map((table: any, index: number) => {
        const label = String(table?.label ?? table?.number ?? `Table ${index + 1}`);
        const number = Number.parseInt(label.replace(/\D/g, ''), 10) || index + 1;
        return {
          id: String(table?._id ?? table?.id ?? `table-${index + 1}`),
          number,
          label,
          capacity: Number(table?.capacity ?? 4),
          status: (table?.status ?? 'available') as TableItem['status'],
          location: table?.location ?? (number <= 2 ? 'Window View' : number <= 4 ? 'Center Hall' : 'Plant Corner'),
          notes: table?.notes ?? '',
        };
      });

      setTables(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTables();
    const interval = setInterval(() => {
      void loadTables();
    }, 5000);
    return () => clearInterval(interval);
  }, [branchId]);

  const handleSelectTable = (table: TableItem) => {
    setTableNumber(table.number);
  };

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.label.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        String(t.number).includes(q)
      );
    });
  }, [tables, searchQuery]);

  const summary = useMemo(
    () => ({
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
      totalSeats: tables.reduce((acc, t) => acc + t.capacity, 0),
    }),
    [tables]
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header with View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dining Room & Table Selection"
          description={`Explore seating and live tables at ${currentBranch?.name || 'Downtown Hall'}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <TenantSelector variant="pill" />
          <div className="flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode('floor')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'floor'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
              }`}
            >
              <span>🖼️</span> Visual Floor Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
              }`}
            >
              <span>📋</span> Grid Cards
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadTables()}
            className="rounded-xl border-neutral-300 dark:border-neutral-700"
            title="Refresh floor data"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Live Floor Stat Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {summary.available} Tables Ready to Sit
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          {summary.occupied} Occupied
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {summary.reserved} Reserved
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-bold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          👥 {summary.totalSeats} Total Dining Seats
        </span>
      </div>

      {/* Seated Table Notification Banner */}
      {activeTableNumber && (
        <Card className="rounded-[24px] border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 p-4 dark:border-amber-400/40 dark:bg-amber-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 font-black text-xl text-neutral-950 shadow-md">
                {activeTableNumber}
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">
                  Currently Seated at Table {activeTableNumber} 🍽️
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Any items added to your cart will be tagged and served directly to Table {activeTableNumber}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300"
                onClick={() => navigate(ROUTES.CUSTOMER.MENU)}
              >
                Browse Menu & Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setTableNumber(undefined)}
              >
                Change Table
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content: Visual Floor View vs Grid Cards */}
      {viewMode === 'floor' ? (
        <RestaurantFloorView
          tables={tables}
          selectedTableNumber={activeTableNumber}
          onSelectTable={handleSelectTable}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-4">
          {/* Search bar for grid view */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search table by name or zone (e.g. Window, Table 2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 focus:border-amber-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTables.map((table) => {
              const isSelected = activeTableNumber === table.number;
              const isAvailable = table.status === 'available';

              return (
                <Card
                  key={table.id}
                  className={`rounded-[24px] p-5 transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-amber-400 bg-amber-50/40 shadow-lg dark:border-amber-400 dark:bg-amber-950/20'
                      : 'border-neutral-200 bg-white hover:-translate-y-1 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 font-bold text-lg text-white dark:bg-neutral-800">
                        {table.number}
                      </span>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">{table.label}</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{table.location}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        table.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : table.status === 'occupied'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    <span>👥 Capacity: {table.capacity} Guests</span>
                    <span>📍 {table.location}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {isAvailable ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full rounded-xl bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300"
                        onClick={() => {
                          setTableNumber(table.number);
                          navigate(ROUTES.CUSTOMER.MENU);
                        }}
                      >
                        🍽️ Sit & Order Here
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs"
                        onClick={() => {
                          setTableNumber(table.number);
                          navigate(ROUTES.CUSTOMER.MENU);
                        }}
                      >
                        Join Table {table.number}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
