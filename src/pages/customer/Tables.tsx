import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { LocationPickerModal, PageHeader, TenantSelector } from '@/components/common';
import RestaurantFloorView, { type TableItem } from '@/components/common/RestaurantFloorView';
import { tablesApi } from '@/api';
import { ROUTES } from '@/constants';
import { useCartStore, useTenantStore } from '@/store';
import { formatDistance } from '@/utils/geolocation';

export default function CustomerTables() {
  const navigate = useNavigate();
  const {
    branchId,
    currentBranch,
    allBranches,
    nearestBranch,
    userLocation,
    onlyNearby,
    maxRadiusKm,
    setMaxRadiusKm,
    setOnlyNearby,
    isLocating,
    requestUserLocation,
    switchBranch,
  } = useTenantStore();
  const activeTableNumber = useCartStore((s) => s.tableNumber);
  const setTableNumber = useCartStore((s) => s.setTableNumber);

  const [tables, setTables] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'floor' | 'grid'>('floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationPanelOpen, setIsLocationPanelOpen] = useState(false);

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

      <section className="rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50/80 p-5 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                GPS Location Powered
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              Nearby Branches & Outlets 📍
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {userLocation
                ? `Showing outlets near ${userLocation.displayName || userLocation.city} (within ${maxRadiusKm} km)`
                : 'Select your nearest branch for fastest table seating & hot delivery'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void requestUserLocation()}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {isLocating ? 'Finding kitchens...' : userLocation ? <>🎯 {userLocation.city || 'Located'} <span className="text-[10px] opacity-75">(Refresh)</span></> : '📍 Find kitchens near me'}
            </button>
            <button
              type="button"
              onClick={() => setIsLocationPanelOpen(true)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              Change Location / Filter
            </button>
          </div>
        </div>

        {(() => {
          const displayedNearbyBranches = onlyNearby && userLocation
            ? allBranches.filter((branch) => (branch.distanceKm ?? 9999) <= maxRadiusKm)
            : allBranches;

          if (displayedNearbyBranches.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-xl text-amber-500">📍</div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No outlets found within {maxRadiusKm} km</h4>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {userLocation?.displayName ? `No active branches within ${maxRadiusKm} km of ${userLocation.displayName}.` : 'No active branches found nearby.'}
                </p>
                {nearestBranch && (
                  <div className="mx-auto mt-4 max-w-md rounded-xl border border-neutral-200 bg-white p-3 text-left shadow-sm dark:border-neutral-800 dark:bg-neutral-850">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Closest Available Outlet:</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{nearestBranch.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">📍 {nearestBranch.address || 'Dining Hall'} • {formatDistance(nearestBranch.distanceKm)}</p>
                      </div>
                      <button type="button" onClick={() => switchBranch(nearestBranch._id)} className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600">Select Branch</button>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button type="button" onClick={() => setMaxRadiusKm(50)} className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">Expand to 50 km</button>
                  <button type="button" onClick={() => setOnlyNearby(false)} className="rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300">View All Outlets</button>
                </div>
              </div>
            );
          }

          return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayedNearbyBranches.slice(0, 6).map((branch, index) => {
                const isSelected = branch._id === branchId;
                const isClosest = index === 0 && Boolean(userLocation) && branch.distanceKm !== undefined;
                return (
                  <div key={branch._id} onClick={() => switchBranch(branch._id)} className={`group cursor-pointer rounded-2xl border p-4 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-500/60 dark:bg-emerald-950/20' : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-850 dark:hover:border-neutral-700'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-neutral-400'}`} /><h4 className="text-sm font-bold text-neutral-900 dark:text-white">{branch.name}</h4></div>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">📍 {branch.address || 'Dining Hall & Takeaway Counter'}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isSelected ? 'bg-emerald-500 text-white' : 'bg-neutral-100 font-medium text-neutral-600 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}`}>{isSelected ? 'Active' : 'Select'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800/80">
                      <div className="flex items-center gap-1.5">{branch.distanceKm !== undefined ? <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">📍 {formatDistance(branch.distanceKm)}</span> : <span className="text-[10px] text-neutral-400">Outlet Location</span>}{isClosest && <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">⭐ Nearest</span>}</div>
                      <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">{isSelected ? 'Currently Selected' : 'Switch Branch →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      <LocationPickerModal
        isOpen={isLocationPanelOpen}
        onClose={() => setIsLocationPanelOpen(false)}
      />

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
