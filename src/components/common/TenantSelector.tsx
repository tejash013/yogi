import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useTenantStore } from '@/store';
import { ROUTES } from '@/constants';

interface TenantSelectorProps {
  variant?: 'pill' | 'banner' | 'card' | 'badge';
  className?: string;
  showDetails?: boolean;
}

export default function TenantSelector({
  variant = 'pill',
  className = '',
  showDetails = false,
}: TenantSelectorProps) {
  const {
    restaurantId,
    branchId,
    currentRestaurant,
    currentBranch,
    availableRestaurants,
    availableBranches,
    isModalOpen,
    setModalOpen,
    loadTenants,
    switchBranch,
    switchRestaurant,
  } = useTenantStore();

  const user = useAuthStore((s) => s.user);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const restaurantName = currentRestaurant?.name || 'Yogi Grand Restaurant';
  const branchName = currentBranch?.name || 'Main Dining Hall (Downtown)';

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/90 px-3 py-1 text-xs dark:border-amber-500/20 dark:bg-amber-950/40 ${className}`}>
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold text-amber-950 dark:text-amber-200">{restaurantName}</span>
        <span className="text-amber-400 dark:text-amber-600">•</span>
        <span className="text-amber-800 dark:text-amber-300">{branchName}</span>
      </div>
    );
  if (variant === 'card') {
    return (
      <div className={`rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-3 dark:border-neutral-700/80 dark:bg-neutral-800/80 ${className}`}>
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Branch
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-300"
          >
            Switch
          </button>
        </div>
        <p className="mt-1.5 truncate text-xs font-bold text-neutral-900 dark:text-white">
          {restaurantName}
        </p>
        <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
          📍 {branchName}
        </p>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-[24px] border border-amber-400/30 bg-gradient-to-r from-[#1e1915] via-[#241e1a] to-[#1a1512] p-4 text-white shadow-md sm:p-5 ${className}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-xl border border-amber-400/30">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">SaaS Multi-Tenant Mode</span>
                <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-mono text-amber-200">REST: {restaurantId.slice(-6)}</span>
                <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-mono text-emerald-200">BR: {branchId.slice(-6)}</span>
              </div>
              <h4 className="mt-0.5 font-bold text-white sm:text-base">
                {restaurantName} <span className="font-normal text-amber-200/70">/ {branchName}</span>
              </h4>
              {showDetails && currentBranch?.address && (
                <p className="mt-0.5 text-xs text-neutral-400">📍 {currentBranch.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-400/20"
            >
              🔄 Switch Branch / Location
            </button>
            {(user?.role === 'platformAdmin' || user?.role === 'owner') && (
              <Link
                to={ROUTES.WORKSPACE}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20"
              >
                ⚙️ Workspace
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Pill Trigger */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`group flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs shadow-sm transition-all hover:border-amber-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/90 ${className}`}
        title="Switch Restaurant or Branch location"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
          <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[120px] sm:max-w-[160px]">
            {restaurantName}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-[100px] sm:max-w-[140px]">
            {branchName}
          </span>
        </div>
        <svg
          className="h-3.5 w-3.5 text-neutral-400 transition-transform group-hover:translate-y-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* SaaS Multi-Tenant Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-[#48392d] bg-[#171412] p-6 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#302620] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
                    SaaS Tenant Switcher
                  </span>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                    Multi-Branch Network
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">Choose Location & Branch</h3>
                <p className="text-xs text-[#a0907e]">
                  Select the dining location you are ordering from or managing. Menu, tables, and orders adapt dynamically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Current Active Tenant IDs Card */}
            <div className="mt-4 rounded-2xl border border-[#3e3126] bg-[#1f1a16] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7c6b4]">Active Tenant Context</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#30261f] bg-[#14110f] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9d8d7e]">Restaurant ID</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(restaurantId, 'rest')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      {copiedKey === 'rest' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-amber-200">{restaurantId}</p>
                </div>

                <div className="rounded-xl border border-[#30261f] bg-[#14110f] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9d8d7e]">Branch ID</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(branchId, 'branch')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      {copiedKey === 'branch' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-emerald-300">{branchId}</p>
                </div>
              </div>
            </div>

            {/* Multi-Restaurant Switcher (if multiple available) */}
            {availableRestaurants.length > 1 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d7c6b4]">Restaurants</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableRestaurants.map((rest) => (
                    <button
                      key={rest._id}
                      type="button"
                      onClick={() => void switchRestaurant(rest._id)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        rest._id === restaurantId
                          ? 'border-amber-400 bg-amber-500/15 text-white shadow-sm'
                          : 'border-[#30261f] bg-[#1b1714] text-neutral-300 hover:border-amber-500/40 hover:bg-[#221c18]'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{rest.name}</p>
                        <p className="text-[11px] text-[#9d8d7e]">/{rest.slug}</p>
                      </div>
                      {rest._id === restaurantId && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-neutral-950">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Branch Locations for Active Restaurant */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7c6b4]">
                  Branches for {restaurantName}
                </p>
                <span className="text-xs text-[#9d8d7e]">{availableBranches.length} locations</span>
              </div>

              <div className="grid gap-3">
                {availableBranches.map((br) => {
                  const isSelected = br._id === branchId;
                  return (
                    <div
                      key={br._id}
                      onClick={() => {
                        switchBranch(br._id);
                        setModalOpen(false);
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/40'
                          : 'border-[#30261f] bg-[#1b1714] hover:border-neutral-500 hover:bg-[#221c18]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                            <h4 className="font-bold text-white text-base">{br.name}</h4>
                          </div>
                          <p className="mt-1 text-xs text-[#a0907e]">
                            📍 {br.address || 'Dining Hall & Takeaway Counter'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isSelected ? 'bg-emerald-400 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            {isSelected ? '✓ Current' : 'Select'}
                          </span>
                          <span className="font-mono text-[9px] text-[#786c60]">{br._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-[#302620] pt-4">
              {(user?.role === 'platformAdmin' || user?.role === 'owner') ? (
                <Link
                  to={ROUTES.WORKSPACE}
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:underline"
                >
                  <span>🏢 Open Tenant Admin Console</span> &rarr;
                </Link>
              ) : (
                <span className="text-[11px] text-[#786c60]">Isolated Multi-Tenant Security Enabled</span>
              )}

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-neutral-950 shadow-md transition-all hover:bg-amber-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
