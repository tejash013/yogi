import { useEffect } from 'react';
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
    isLoading,
    isModalOpen,
    setModalOpen,
    loadTenants,
    switchBranch,
    switchRestaurant,
  } = useTenantStore();

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const restaurantName = currentRestaurant?.name || 'Yogi Grand Restaurant';
  const branchName = currentBranch?.name || 'Main Dining Hall';
  const isCustomer = !user || user.role === 'customer';
  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'platformAdmin';
  const canSwitchContext = isCustomer || isOwnerOrAdmin;

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/90 px-3 py-1 text-xs dark:border-amber-500/20 dark:bg-amber-950/40 ${className}`}>
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold text-amber-950 dark:text-amber-200">{restaurantName}</span>
        <span className="text-amber-400 dark:text-amber-600">•</span>
        <span className="text-amber-800 dark:text-amber-300">{branchName}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-3 dark:border-neutral-700/80 dark:bg-neutral-800/80 ${className}`}>
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {isCustomer ? 'Active Branch' : 'Operating Branch'}
          </span>
          {canSwitchContext ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Switch
            </button>
          ) : (
            <span className="rounded-md bg-neutral-200/70 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              🔒 Assigned
            </span>
          )}
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
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                {isCustomer ? 'Current dining outlet' : 'Assigned operating branch'}
              </span>
              <h4 className="mt-0.5 font-bold text-white sm:text-base">
                {restaurantName} <span className="font-normal text-amber-200/70">/ {branchName}</span>
              </h4>
              {showDetails && currentBranch?.address && (
                <p className="mt-0.5 text-xs text-neutral-400">📍 {currentBranch.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canSwitchContext ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-400/20"
              >
                🔄 Switch Outlet
              </button>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300">
                🔒 Assigned Branch Context
              </span>
            )}
            {isOwnerOrAdmin && (
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
        title="Switch Restaurant or Branch"
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

      {/* Outlet Selector Modal */}
      {canSwitchContext && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-neutral-700 bg-[#121716] p-4 text-white shadow-2xl sm:rounded-[28px] sm:p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-lg">🏪</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em]">
                    {isOwnerOrAdmin ? 'Operating Branch Context' : 'Select Branch Outlet'}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                  {isOwnerOrAdmin ? 'Switch Operating Branch' : 'Select Restaurant & Branch'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close branch selector"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 text-lg text-neutral-400 transition hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Restaurants */}
            {availableRestaurants.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-300">
                  Restaurants
                </p>
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
                      </div>
                      {rest._id === restaurantId && (
                        <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-neutral-950">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Branches */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d7c6b4]">
                Branches for {restaurantName}
              </p>

              {isLoading ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center text-neutral-400">
                  <span className="mx-auto mb-2 block h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <p className="text-xs font-semibold">Loading outlets...</p>
                </div>
              ) : availableBranches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/60 p-6 text-center text-neutral-300">
                  <p className="text-sm font-bold text-white">No branches available</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {availableBranches.map((br) => {
                    const isSelected = br._id === branchId;
                    return (
                      <button
                        key={br._id}
                        type="button"
                        onClick={() => {
                          switchBranch(br._id);
                          setModalOpen(false);
                        }}
                        className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/40'
                            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-600 hover:bg-neutral-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                              <h4 className="font-bold text-white text-sm">{br.name}</h4>
                            </div>
                            {br.address && (
                              <p className="mt-0.5 text-xs text-neutral-400">📍 {br.address}</p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isSelected ? 'bg-emerald-400 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {isSelected ? '✓ Current' : 'Select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-neutral-950 shadow-md transition-all hover:bg-amber-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
