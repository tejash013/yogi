import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import RestaurantFloorView, { type TableItem } from '@/components/common/RestaurantFloorView';
import { tablesApi } from '@/api';
import { useTenantStore, useOrderSyncStore } from '@/store';
import { QRCodeCanvas } from 'qrcode.react';

type TableRow = TableItem;
type QrAsset = { tableId: string; label: string; url: string };

const defaultNewTable = {
  label: '',
  capacity: '2',
  status: 'available' as TableRow['status'],
  location: 'Main hall',
  notes: '',
};

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; label: string; accent: string }> = {
  available: { variant: 'success', label: 'Available', accent: 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-200 dark:text-emerald-300 dark:ring-emerald-900/60' },
  occupied: { variant: 'error', label: 'Occupied', accent: 'bg-rose-500/12 text-rose-700 ring-1 ring-rose-200 dark:text-rose-300 dark:ring-rose-900/60' },
  reserved: { variant: 'warning', label: 'Reserved', accent: 'bg-amber-500/12 text-amber-700 ring-1 ring-amber-200 dark:text-amber-300 dark:ring-amber-900/60' },
  cleaning: { variant: 'info', label: 'Cleaning', accent: 'bg-sky-500/12 text-sky-700 ring-1 ring-sky-200 dark:text-sky-300 dark:ring-sky-900/60' },
};

export default function Tables() {
  const { branchId, restaurantId, currentBranch } = useTenantStore();
  const syncVersion = useOrderSyncStore((state) => state.version);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'floor' | 'cards'>('floor');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newTable, setNewTable] = useState(defaultNewTable);

  // Edit table state
  const [editingTable, setEditingTable] = useState<TableRow | null>(null);
  const [editForm, setEditForm] = useState({
    label: '',
    capacity: '2',
    status: 'available' as TableRow['status'],
    location: '',
    notes: '',
  });
  const [editError, setEditError] = useState('');

  // QR Asset state
  const [qrAsset, setQrAsset] = useState<QrAsset | null>(null);
  const [qrLoading, setQrLoading] = useState<string | null>(null);

  const loadTables = async () => {
    setIsLoading(true);
    try {
      const response = await tablesApi.getAll().catch(() => ({ data: { data: [] } }));
      const list = Array.isArray(response?.data?.data) ? response.data.data : Array.isArray(response?.data) ? response.data : [];

      const mapped: TableRow[] = list.map((table: any, index: number) => {
        const label = String(table?.label ?? table?.number ?? `Table ${index + 1}`);
        const number = Number.parseInt(label.replace(/\D/g, ''), 10) || index + 1;
        return {
          id: String(table?._id ?? table?.id ?? `table-${index + 1}`),
          number,
          label,
          capacity: Number(table?.capacity ?? 4),
          status: (table?.status ?? 'available') as TableRow['status'],
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
  }, [branchId, restaurantId, syncVersion]);

  const handleStatusUpdate = async (tableId: string, nextStatus: TableRow['status']) => {
    if (tableId.startsWith('virtual-')) return;
    try {
      await tablesApi.updateStatus(tableId, nextStatus);
      await loadTables();
    } catch (err) {
      console.error('Failed to update table status', err);
    }
  };

  const handleCreateTable = async () => {
    const label = newTable.label.trim();
    const capacity = Number(newTable.capacity);

    if (!label) {
      setCreateError('Table label is required.');
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      setCreateError('Capacity must be a valid number greater than zero.');
      return;
    }

    setIsSaving(true);
    setCreateError('');

    try {
      const createdRes = await tablesApi.create({
        label,
        capacity,
        status: newTable.status,
        location: newTable.location.trim() || 'Main hall',
        notes: newTable.notes.trim(),
      });

      const createdTable = createdRes.data.data;
      const createdId = String((createdTable as any)?._id ?? (createdTable as any)?.id);

      setNewTable(defaultNewTable);
      setShowCreateForm(false);
      await loadTables();

      // Auto generate QR for newly created table
      if (createdId) {
        try {
          const qrRes = await tablesApi.generateQrToken(createdId);
          setQrAsset(qrRes.data.data);
        } catch {
          // ignore QR error if token generation fails
        }
      }
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create table.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (table: TableRow) => {
    setEditingTable(table);
    setEditForm({
      label: table.label,
      capacity: String(table.capacity),
      status: table.status,
      location: table.location,
      notes: table.notes || '',
    });
    setEditError('');
    // Also auto-fetch QR for editing modal view
    void handleGenerateQr(table);
  };

  const handleSaveEdit = async () => {
    if (!editingTable) return;

    const label = editForm.label.trim();
    const capacity = Number(editForm.capacity);

    if (!label) {
      setEditError('Table label is required.');
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      setEditError('Capacity must be a valid number greater than zero.');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      await tablesApi.update(editingTable.id, {
        label,
        capacity,
        status: editForm.status,
        location: editForm.location.trim() || 'Main hall',
        notes: editForm.notes.trim(),
      });

      setEditingTable(null);
      await loadTables();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Unable to update table.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await tablesApi.delete(tableId);
      if (editingTable?.id === tableId) setEditingTable(null);
      if (qrAsset?.tableId === tableId) setQrAsset(null);
      await loadTables();
    } catch (error) {
      console.error('Failed to delete table', error);
    }
  };

  const handleGenerateQr = async (table: TableRow) => {
    setQrLoading(table.id);
    try {
      const response = await tablesApi.generateQrToken(table.id);
      const data = response.data.data;
      const origin = window.location.origin;
      const url = `${origin}/scan/table/${data.token}`;
      setQrAsset({ ...data, url });
    } catch (error) {
      console.error('Failed to generate table QR', error);
    } finally {
      setQrLoading(null);
    }
  };

  const handleDownloadQr = () => {
    const canvas = document.getElementById('table-qr-canvas') as HTMLCanvasElement | null;
    if (!canvas || !qrAsset) return;
    const link = document.createElement('a');
    link.download = `${qrAsset.label.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrintQr = () => {
    const canvas = document.getElementById('table-qr-canvas') as HTMLCanvasElement | null;
    if (!canvas || !qrAsset) return;
    const printWindow = window.open('', '_blank', 'width=480,height=640');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>${qrAsset.label} QR Code</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:32px}img{width:280px;height:280px;margin:16px 0}h1{font-size:24px;margin:0}p{color:#555;font-size:14px}</style></head><body><h1>${qrAsset.label}</h1><img src="${canvas.toDataURL('image/png')}" alt="${qrAsset.label} QR code"/><p>Scan with your camera to open table menu & place orders</p></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const summary = useMemo(() => ({
    available: tables.filter((table) => table.status === 'available').length,
    occupied: tables.filter((table) => table.status === 'occupied').length,
    reserved: tables.filter((table) => table.status === 'reserved').length,
    cleaning: tables.filter((table) => table.status === 'cleaning').length,
    totalSeats: tables.reduce((total, table) => total + table.capacity, 0),
  }), [tables]);

  const occupancyRate = tables.length ? Math.round((summary.occupied / tables.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dining Tables & Floor Plan"
        description={`Manage floor layout, reservations, and QR code facility for ${currentBranch?.name || 'Downtown Hall'}`}
        actions={
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
                <span>🖼️</span> Floor Map
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                }`}
              >
                <span>📋</span> Cards
              </button>
            </div>
            <Button
              variant="primary"
              className="rounded-full bg-[#171412] text-white hover:bg-[#2a241f] dark:bg-[#f3d7a2] dark:text-[#171412]"
              onClick={() => setShowCreateForm((current) => !current)}
            >
              {showCreateForm ? 'Close' : '+ Add Table'}
            </Button>
          </div>
        }
      />

      {/* CREATE NEW TABLE FORM */}
      {showCreateForm ? (
        <Card className="rounded-[28px] border-[#efe4d7] bg-[#fffdfb] p-6 shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">➕ Add New Dining Table</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Table Label</label>
              <input
                value={newTable.label}
                onChange={(event) => setNewTable((current) => ({ ...current, label: event.target.value }))}
                className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Table 12"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Capacity (Seats)</label>
              <input
                type="number"
                min="1"
                value={newTable.capacity}
                onChange={(event) => setNewTable((current) => ({ ...current, capacity: event.target.value }))}
                className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Status</label>
              <select
                value={newTable.status}
                onChange={(event) => setNewTable((current) => ({ ...current, status: event.target.value as TableRow['status'] }))}
                className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Location / Zone</label>
              <input
                value={newTable.location}
                onChange={(event) => setNewTable((current) => ({ ...current, location: event.target.value }))}
                className="w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Main hall"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Notes / Details</label>
            <textarea
              value={newTable.notes}
              onChange={(event) => setNewTable((current) => ({ ...current, notes: event.target.value }))}
              className="min-h-20 w-full rounded-xl border border-[#eadcc7] bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder="Window seat, party of four, etc."
            />
          </div>

          {createError ? <p className="mt-3 text-sm text-red-600">{createError}</p> : null}

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateTable()} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Generate QR'}
            </Button>
          </div>
        </Card>
      ) : null}

      {/* EDIT TABLE MODAL WITH QR FACILITY */}
      {editingTable ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                ✏️ Edit {editingTable.label} & QR Facility
              </h3>
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-600 uppercase dark:text-neutral-400">Table Label</label>
                <input
                  value={editForm.label}
                  onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-600 uppercase dark:text-neutral-400">Capacity (Seats)</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-600 uppercase dark:text-neutral-400">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TableRow['status'] }))}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-600 uppercase dark:text-neutral-400">Location / Zone</label>
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold text-neutral-600 uppercase dark:text-neutral-400">Notes / Ambiance</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  className="min-h-16 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* QR CODE FACILITY BLOCK INSIDE EDIT MODAL */}
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    📷 QR Code Facility
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Customers scan this QR code at {editingTable.label} to view menu & order.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={qrLoading === editingTable.id}
                  onClick={() => void handleGenerateQr(editingTable)}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500 dark:text-emerald-300"
                >
                  {qrLoading === editingTable.id ? 'Generating...' : '🔄 Rotate / Refresh QR Token'}
                </Button>
              </div>

              {qrAsset && qrAsset.tableId === editingTable.id ? (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                  <QRCodeCanvas id="table-qr-canvas" value={qrAsset.url} size={180} includeMargin level="H" />
                  <p className="max-w-md truncate text-[11px] text-neutral-500">{qrAsset.url}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleDownloadQr}>Download PNG</Button>
                    <Button size="sm" variant="outline" onClick={handlePrintQr}>Print QR</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-center">
                  <Button size="sm" onClick={() => void handleGenerateQr(editingTable)}>
                    Show QR Code Preview
                  </Button>
                </div>
              )}
            </div>

            {editError ? <p className="mt-3 text-sm text-red-600">{editError}</p> : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                onClick={() => void handleDeleteTable(editingTable.id)}
              >
                🗑️ Delete Table
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditingTable(null)}>
                  Cancel
                </Button>
                <Button onClick={() => void handleSaveEdit()} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* STANDALONE QR CODE MODAL */}
      {qrAsset && !editingTable ? (
        <Card className="flex flex-col items-center gap-4 rounded-[28px] border-emerald-200 bg-emerald-50/70 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Table QR facility</p>
            <h3 className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">{qrAsset.label}</h3>
          </div>
          <QRCodeCanvas id="table-qr-canvas" value={qrAsset.url} size={240} includeMargin level="H" />
          <p className="max-w-lg break-all text-xs text-neutral-500">{qrAsset.url}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleDownloadQr}>Download PNG</Button>
            <Button variant="outline" onClick={handlePrintQr}>Print QR</Button>
            <Button variant="ghost" onClick={() => setQrAsset(null)}>Close</Button>
          </div>
        </Card>
      ) : null}

      {/* MAIN VIEW: FLOOR MAP OR CARDS */}
      {viewMode === 'floor' ? (
        <RestaurantFloorView
          tables={tables}
          isAdmin={true}
          onStatusChange={handleStatusUpdate}
          isLoading={isLoading}
        />
      ) : (
        <>
          <Card className="overflow-hidden rounded-[30px] border-[#efe4d7] bg-gradient-to-br from-[#201a17] via-[#171412] to-[#2d241f] shadow-[0_20px_60px_rgba(42,33,28,0.15)] dark:border-neutral-700">
            <div className="bg-[radial-gradient(circle_at_top,_rgba(231,189,117,0.22),_transparent_35%)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0d7aa]">Floor overview</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Service pace is balanced.</h3>
                  <p className="mt-2 max-w-xl text-sm text-neutral-300">Monitor occupancy, reservation flow, and quick-turn table readiness across the dining room.</p>
                </div>
                <div className="rounded-[24px] border border-[#4c3a2b] bg-[#120f0d]/60 px-5 py-4 text-left backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7c9b7]">Occupancy</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-3xl font-semibold text-white">{occupancyRate}%</span>
                    <span className="rounded-full bg-[#f0d7aa] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#241d18]">Live</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Available', value: summary.available, tone: 'text-emerald-300' },
                  { label: 'Occupied', value: summary.occupied, tone: 'text-rose-300' },
                  { label: 'Reserved', value: summary.reserved, tone: 'text-amber-300' },
                  { label: 'Seats', value: summary.totalSeats, tone: 'text-[#f0d7aa]' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-[#3d3129] bg-[#120f0d]/50 p-5">
                    <p className="text-sm text-[#d7c9b7]">{item.label}</p>
                    <p className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {isLoading ? (
            <div className="rounded-[28px] border border-dashed border-[#eadcc7] bg-[#f9f4ee] p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              Loading table status...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tables.map((table) => {
                const config = statusConfig[table.status] ?? { variant: 'info', label: 'Available', accent: 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-slate-700' };
                return (
                  <Card key={table.id} className="rounded-[28px] border-[#efe4d7] bg-[#fffdfb] p-5 shadow-[0_18px_50px_rgba(85,68,44,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(85,68,44,0.09)] dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#a57a3f] dark:text-[#f0d7aa]">Table {table.number}</p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">{table.location}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${config.accent}`}>
                        {config.label}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Capacity</p>
                        <p className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">{table.capacity} guests</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0d7aa] text-lg text-[#241d18]">{table.capacity > 6 ? '🍽️' : '✨'}</div>
                    </div>

                    {table.notes ? (
                      <p className="mt-4 rounded-[18px] border border-[#f0e4d7] bg-[#f7f1ea] px-3 py-2 text-xs leading-5 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {table.notes}
                      </p>
                    ) : (
                      <p className="mt-4 rounded-[18px] border border-dashed border-[#eadcc7] bg-[#faf7f4] px-3 py-2 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                        No special notes for this table.
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleStartEdit(table)}>
                        ✏️ Edit & QR
                      </Button>
                      <Button size="sm" variant="ghost" disabled={qrLoading === table.id} onClick={() => void handleGenerateQr(table)}>
                        {qrLoading === table.id ? 'Generating...' : '📷 QR Code'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => void handleDeleteTable(table.id)}>
                        🗑️
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
