import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useCartStore } from '@/store';
import { tablesApi } from '@/api';

export type TableItem = {
  id: string;
  number: number;
  label: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location: string;
  notes?: string;
};

interface RestaurantFloorViewProps {
  tables: TableItem[];
  selectedTableNumber?: number;
  onSelectTable?: (table: TableItem) => void;
  isAdmin?: boolean;
  onStatusChange?: (tableId: string, nextStatus: TableItem['status']) => Promise<void> | void;
  isLoading?: boolean;
}

const statusBadges: Record<TableItem['status'], { label: string; color: string; ring: string; dot: string; bg: string }> = {
  available: {
    label: 'Available',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/40 border-emerald-500/30',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-950/40',
  },
  occupied: {
    label: 'Occupied',
    color: 'text-rose-400',
    ring: 'ring-rose-500/40 border-rose-500/30',
    dot: 'bg-rose-400',
    bg: 'bg-rose-950/40',
  },
  reserved: {
    label: 'Reserved',
    color: 'text-amber-400',
    ring: 'ring-amber-500/40 border-amber-500/30',
    dot: 'bg-amber-400',
    bg: 'bg-amber-950/40',
  },
  cleaning: {
    label: 'Cleaning',
    color: 'text-sky-400',
    ring: 'ring-sky-500/40 border-sky-500/30',
    dot: 'bg-sky-400',
    bg: 'bg-sky-950/40',
  },
};

export default function RestaurantFloorView({
  tables,
  selectedTableNumber: propSelectedTableNumber,
  onSelectTable,
  isAdmin = false,
  onStatusChange,
  isLoading = false,
}: RestaurantFloorViewProps) {
  const navigate = useNavigate();
  const currentStoreTable = useCartStore((s) => s.tableNumber);
  const setStoreTableNumber = useCartStore((s) => s.setTableNumber);

  const activeTableNumber = propSelectedTableNumber ?? currentStoreTable;
  const [activeModalTable, setActiveModalTable] = useState<TableItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [partySize, setPartySize] = useState('2');
  const [reserveTime, setReserveTime] = useState('19:30');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Render only tables returned by the active branch's backend query.
  const allVisualTables = tables;

  const filteredTables = allVisualTables.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  const handleTableClick = (table: TableItem) => {
    setActiveModalTable(table);
    setReservationSuccess(false);
  };

  const handleSitAndOrder = async (table: TableItem) => {
    setStoreTableNumber(table.number);
    try {
      await tablesApi.updateStatus(table.id, 'occupied');
    } catch (err) {
      console.error('Failed to update table occupancy in database', err);
    }
    if (onSelectTable) onSelectTable(table);
    setActiveModalTable(null);
    navigate(ROUTES.CUSTOMER.MENU);
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTable) return;
    setIsUpdatingStatus(true);
    try {
      await tablesApi.reserve(activeModalTable.id);
      if (onStatusChange) {
        await onStatusChange(activeModalTable.id, 'reserved');
      }
      setReservationSuccess(true);
    } catch {
      setReservationSuccess(false);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAdminStatusToggle = async (table: TableItem, nextStatus: TableItem['status']) => {
    setIsUpdatingStatus(true);
    try {
      if (onStatusChange) {
        await onStatusChange(table.id, nextStatus);
      } else {
        await tablesApi.updateStatus(table.id, nextStatus);
      }
      setActiveModalTable((prev) => (prev ? { ...prev, status: nextStatus } : null));
    } catch (err) {
      console.error('Failed to update table status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const counts = {
    available: allVisualTables.filter((t) => t.status === 'available').length,
    occupied: allVisualTables.filter((t) => t.status === 'occupied').length,
    reserved: allVisualTables.filter((t) => t.status === 'reserved').length,
    cleaning: allVisualTables.filter((t) => t.status === 'cleaning').length,
  };

  return (
    <div className="relative w-full select-none overflow-hidden rounded-[32px] border border-[#3e342c]/60 bg-[#161311] shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
      {/* Top Ambient Bar & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#302720]/80 bg-gradient-to-r from-[#1c1815] via-[#221c18] to-[#1c1815] px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e0caa7]">
              Interactive Dining Floor Plan
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#a89b8d]">
            {isAdmin ? 'Monitor live table occupancy & toggle statuses' : 'Select a table to sit and start ordering delicious food'}
          </p>
        </div>

        {/* Status Filters & Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'bg-[#28211c] text-[#cfc2b2] hover:bg-[#342b25]'
            }`}
          >
            All ({allVisualTables.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('available')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'available'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-[#28211c] text-emerald-400 hover:bg-[#342b25]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Available ({counts.available})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('occupied')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'occupied'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-[#28211c] text-rose-400 hover:bg-[#342b25]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Occupied ({counts.occupied})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('reserved')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'reserved'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-[#28211c] text-amber-400 hover:bg-[#342b25]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Reserved ({counts.reserved})
          </button>
        </div>
      </div>

      {/* Main Floor Scenic Canvas */}
      <div className="relative min-h-[640px] w-full overflow-hidden bg-gradient-to-b from-[#2b241e] via-[#1e1915] to-[#120f0d] p-6 sm:p-10">
        {/* Left Side: Floor to Ceiling Glass Window Facade */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 border-r border-[#4c3d31]/50 bg-gradient-to-r from-[#2c3d4a]/20 via-[#1e2a33]/10 to-transparent sm:w-20">
          <div className="flex h-full flex-col justify-between py-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7d92a0] [writing-mode:vertical-lr] rotate-180">
              Glass Garden Facade
            </span>
            <div className="space-y-4 px-2">
              <div className="h-8 w-1.5 rounded-full bg-amber-300/20 mx-auto" />
              <div className="h-8 w-1.5 rounded-full bg-amber-300/30 mx-auto" />
              <div className="h-8 w-1.5 rounded-full bg-amber-300/20 mx-auto" />
            </div>
          </div>
        </div>

        {/* Right Side: Wooden Slat Wall with Cascading Vines */}
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 border-l border-[#594230]/60 bg-gradient-to-l from-[#36271c] via-[#241a13] to-transparent sm:w-20">
          <div className="flex h-full flex-col items-center justify-between py-6">
            <span className="text-xl">🌿</span>
            <div className="space-y-2 text-center text-xs opacity-70">
              <span>🍃</span>
              <span>🌱</span>
              <span>🌿</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a0876c] [writing-mode:vertical-lr]">
              Greenery Slat Wall
            </span>
          </div>
        </div>

        {/* Background Wall Graphics & Lighting Illumination (Matching the Reference Picture) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          {/* Top Wall Drop Down Lamps with Glowing Light Cones */}
          <div className="relative flex w-full max-w-4xl justify-around px-8">
            {[1, 2, 3].map((lamp) => (
              <div key={lamp} className="relative flex flex-col items-center">
                {/* Ceiling Wire */}
                <div className="h-10 w-0.5 bg-neutral-600" />
                {/* Black Bell Fixture */}
                <div className="relative h-6 w-12 rounded-t-full bg-neutral-900 shadow-md ring-1 ring-neutral-700">
                  <div className="absolute -bottom-1 left-1/2 h-2.5 w-6 -translate-x-1/2 rounded-full bg-amber-300 blur-[2px]" />
                </div>
                {/* Conical Light Beam Glow */}
                <div className="absolute top-16 h-80 w-64 -translate-y-6 bg-gradient-to-b from-amber-400/20 via-amber-400/5 to-transparent blur-2xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Wall Typography & Kitchen Cloche Mural */}
        <div className="pointer-events-none mb-10 flex flex-col items-center justify-center pt-2 text-center">
          <div className="flex items-center justify-center gap-8 opacity-80 sm:gap-14">
            <div className="flex flex-col items-center gap-1 text-[#d8c3a5]">
              <span className="text-2xl sm:text-3xl">🍴</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl">👨‍🍳</span>
              <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#f3e5d0] sm:text-4xl">
                Good Food Good Mood
              </h2>
              <div className="mt-1 h-0.5 w-24 rounded-full bg-gradient-to-r from-transparent via-[#e7be7d] to-transparent" />
            </div>
            <div className="flex flex-col items-center gap-1 text-[#d8c3a5]">
              <span className="text-2xl sm:text-3xl">🍲</span>
            </div>
          </div>
        </div>

        {/* Currently Selected Dining Table Toast/Banner */}
        {activeTableNumber && (
          <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-amber-500/40 bg-amber-950/60 p-3.5 text-center shadow-lg shadow-amber-950/40 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg text-neutral-950 font-black">
                  {activeTableNumber}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    You are seated at Table {activeTableNumber}
                  </p>
                  <p className="text-[11px] text-[#dacbb6]">
                    Your food orders will be served directly to Table {activeTableNumber}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="primary"
                  className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-bold text-neutral-950 hover:bg-amber-300"
                  onClick={() => navigate(ROUTES.CUSTOMER.MENU)}
                >
                  Order Menu
                </Button>
                <button
                  type="button"
                  onClick={() => setStoreTableNumber(undefined)}
                  className="rounded-lg p-1.5 text-amber-200 hover:bg-amber-900/50"
                  title="Clear Table"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tables returned by the active branch's live API */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
          {isLoading ? (
            <div className="flex h-80 items-center justify-center text-sm font-medium text-amber-200">
              <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
              Loading restaurant floor...
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-[#6b5138] bg-black/10 px-6 text-center">
              <div>
                <p className="text-base font-bold text-amber-100">No tables are configured for this branch</p>
                <p className="mt-1 text-sm text-[#b6a795]">Live seating will appear here when tables are added in the admin panel.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8 sm:gap-y-16">
              {filteredTables.map((table) => {
                const badge = statusBadges[table.status] ?? statusBadges.available;
                const isSelected = activeTableNumber === table.number;

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className="group relative flex cursor-pointer flex-col items-center transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
                  >
                    {/* Top Chairs (Back Contoured Dining Chairs) */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="h-5 w-14 rounded-t-xl bg-[#26211e] border-t border-[#4f433c] shadow-md transition-all group-hover:-translate-y-1 group-hover:bg-[#342d29]" />
                      <div className="h-5 w-14 rounded-t-xl bg-[#26211e] border-t border-[#4f433c] shadow-md transition-all group-hover:-translate-y-1 group-hover:bg-[#342d29]" />
                    </div>

                    {/* Table Surface with Rich Wooden Finish */}
                    <div
                      className={`relative z-10 flex min-h-[145px] w-full max-w-[250px] flex-col items-center justify-between rounded-2xl p-3.5 shadow-2xl transition-all duration-300 ${
                        isSelected
                          ? 'border-2 border-amber-400 bg-gradient-to-br from-[#c9803b] via-[#945520] to-[#713f14] ring-4 ring-amber-400/30'
                          : 'border border-[#9c6b39]/50 bg-gradient-to-br from-[#ba7c42] via-[#8d5427] to-[#5d3415] hover:border-amber-300/80 group-hover:shadow-[0_15px_35px_rgba(231,166,80,0.25)]'
                      }`}
                    >
                      {/* Top Row on Table: Centerpiece Succulent & Condiments */}
                      <div className="flex w-full items-center justify-between px-2">
                        {/* Mini Plant Centerpiece */}
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950/60 shadow-inner">
                          <span className="text-[11px]">🌿</span>
                        </div>
                        {/* Status Pill Badge */}
                        <div
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${badge.bg} ${badge.ring} ${badge.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot} ${table.status === 'available' ? 'animate-ping' : ''}`} />
                          {badge.label}
                        </div>
                        {/* Condiment Shakers */}
                        <div className="flex items-center gap-0.5 text-[10px] opacity-75">
                          <span>🧂</span>
                        </div>
                      </div>

                      {/* CENTER ACRYLIC STAND WITH TABLE NUMBER (Matches photo's Black Stand Badge) */}
                      <div className="my-1 flex flex-col items-center">
                        <div className="relative flex flex-col items-center justify-center rounded-xl border border-neutral-700/80 bg-gradient-to-b from-neutral-900 to-black px-4 py-1.5 shadow-xl">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#d8c3a5]">
                            Table
                          </span>
                          <span className="text-2xl font-black tracking-tight text-white group-hover:text-amber-300">
                            {table.number}
                          </span>
                        </div>
                        {/* Small Acrylic Stand Base */}
                        <div className="h-1 w-10 rounded-full bg-neutral-800 shadow" />
                      </div>

                      {/* Bottom Info on Table */}
                      <div className="flex w-full items-center justify-between text-[11px] font-semibold text-[#fef5ea] opacity-90 px-1">
                        <span className="flex items-center gap-1">
                          <span>👥</span> {table.capacity} Seats
                        </span>
                        <span className="truncate text-[10px] text-[#f7d9b2]">
                          {table.location}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Chairs (Front Contoured Dining Chairs) */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="h-5 w-14 rounded-b-xl bg-[#26211e] border-b border-[#4f433c] shadow-md transition-all group-hover:translate-y-1 group-hover:bg-[#342d29]" />
                      <div className="h-5 w-14 rounded-b-xl bg-[#26211e] border-b border-[#4f433c] shadow-md transition-all group-hover:translate-y-1 group-hover:bg-[#342d29]" />
                    </div>

                    {/* Interactive "Click to Select" Floating Prompt on Hover */}
                    <div className="mt-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold text-neutral-950 shadow">
                        {table.status === 'available' ? '👉 Click to Sit & Order' : '🔍 View Details'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floor Legend & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#302720]/80 bg-[#161311] px-6 py-4 text-xs text-[#a89b8d]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-[#e0caa7]">Floor Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>Green = Available (Vacant)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span>Red = Occupied (Dining)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span>Amber = Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>Blue = Cleaning</span>
          </div>
        </div>

        <div className="text-right text-[11px] text-[#d7c6b2]">
          💡 Click any table to view amenities, sit down, or book a reservation.
        </div>
      </div>

      {/* INTERACTIVE TABLE ACTION MODAL */}
      {activeModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#524336] bg-gradient-to-b from-[#241e1a] via-[#1a1613] to-[#120f0d] p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#382d24] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 font-black text-2xl text-neutral-950 shadow-lg shadow-amber-500/20">
                  {activeModalTable.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      Table {activeModalTable.number}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        statusBadges[activeModalTable.status]?.bg
                      } ${statusBadges[activeModalTable.status]?.color}`}
                    >
                      {statusBadges[activeModalTable.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#b8a794]">
                    Zone: <span className="font-semibold text-amber-300">{activeModalTable.location}</span> · Capacity: {activeModalTable.capacity} Guests
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalTable(null)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="my-5 space-y-4 text-sm">
              <div className="rounded-2xl border border-[#3c3026] bg-[#1a1512] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#d4c1a9]">
                  Table Information & Ambiance
                </p>
                <p className="mt-1 text-sm text-[#e6d8c8]">
                  {activeModalTable.notes || 'Cozy dining spot with warm ambient lighting, contoured seating, and quick service.'}
                </p>
              </div>

              {/* Staff / Admin Live Status Toggle */}
              {isAdmin && (
                <div className="rounded-2xl border border-[#48392d] bg-[#161210] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Admin Status Override
                  </p>
                  <p className="mb-3 text-xs text-[#a09283]">
                    Change live table state across all cashier and POS screens:
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(['available', 'occupied', 'reserved', 'cleaning'] as TableItem['status'][]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleAdminStatusToggle(activeModalTable, st)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition-all ${
                          activeModalTable.status === st
                            ? 'border-amber-400 bg-amber-400 text-neutral-950 font-black shadow-md'
                            : 'border-[#3d3229] bg-[#221b16] text-[#d4c3b2] hover:bg-[#2d241e]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Reservation Form (If Table is Available or Reserved) */}
              {!isAdmin && activeModalTable.status === 'available' && !reservationSuccess && (
                <form onSubmit={handleReserveSubmit} className="rounded-2xl border border-[#3e3228] bg-[#181411] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Book / Reserve this Table for Later
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#b8a794]">Party Size</label>
                      <select
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#483b2f] bg-[#221c17] px-3 py-1.5 text-xs text-white"
                      >
                        <option value="2">2 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="6">6 Guests</option>
                        <option value="8">8+ Guests</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#b8a794]">Target Time</label>
                      <input
                        type="time"
                        value={reserveTime}
                        onChange={(e) => setReserveTime(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#483b2f] bg-[#221c17] px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#b8a794]">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#483b2f] bg-[#221c17] px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#b8a794]">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#483b2f] bg-[#221c17] px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStatus}
                    className="mt-3 w-full rounded-xl border-amber-400/60 bg-transparent text-xs font-bold text-amber-300 hover:bg-amber-400 hover:text-neutral-950"
                  >
                    {isUpdatingStatus ? 'Confirming...' : '📅 Confirm Reservation'}
                  </Button>
                </form>
              )}

              {reservationSuccess && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center text-emerald-300">
                  <p className="text-sm font-bold">🎉 Table {activeModalTable.number} Reserved Successfully!</p>
                  <p className="mt-1 text-xs text-emerald-200/80">
                    We look forward to hosting you at {reserveTime}.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#382d24] pt-4">
              <Button
                variant="ghost"
                className="rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white"
                onClick={() => setActiveModalTable(null)}
              >
                Close
              </Button>

              {activeModalTable.status === 'available' ? (
                <Button
                  variant="primary"
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-400/25 hover:from-amber-300 hover:to-amber-400"
                  onClick={() => handleSitAndOrder(activeModalTable)}
                >
                  🍽️ Sit Here & Start Order
                </Button>
              ) : activeModalTable.status === 'occupied' ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-rose-500/40 text-xs font-semibold text-rose-300 hover:bg-rose-950/40"
                  onClick={() => handleSitAndOrder(activeModalTable)}
                >
                  Join / Add Order to Table {activeModalTable.number}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
