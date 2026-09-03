import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useTenantStore } from '@/store';
import { ROUTES } from '@/constants';
import { formatDistance, searchLocationQuery, type Coordinates } from '@/utils/geolocation';

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
    nearestBranch,
    isLoading,
    isModalOpen,
    setModalOpen,
    loadTenants,
    switchBranch,
    switchRestaurant,
    userLocation,
    isLocating,
    locationError,
    requestUserLocation,
    onlyNearby,
    setOnlyNearby,
    maxRadiusKm,
    setMaxRadiusKm,
    setManualLocation,
  } = useTenantStore();

  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coordinates[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const restaurantName = currentRestaurant?.name || 'Yogi Grand Restaurant';
  const branchName = currentBranch?.name || 'Main Dining Hall';
  const isCustomer = !user || user.role === 'customer';
  const currentDistanceLabel = formatDistance(currentBranch?.distanceKm);

  const handleLocationSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      setSearchResults(await searchLocationQuery(query));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Proximity filtering: strictly filter by maxRadiusKm when onlyNearby is enabled and location exists
  const displayedBranches =
    onlyNearby && userLocation
      ? availableBranches.filter((b) => (b.distanceKm ?? 9999) <= maxRadiusKm)
      : availableBranches;

  const displayedRestaurants =
    onlyNearby && userLocation
      ? availableRestaurants.filter((r) => (r.distanceKm ?? 9999) <= maxRadiusKm)
      : availableRestaurants;

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/90 px-3 py-1 text-xs dark:border-amber-500/20 dark:bg-amber-950/40 ${className}`}>
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold text-amber-950 dark:text-amber-200">{restaurantName}</span>
        <span className="text-amber-400 dark:text-amber-600">•</span>
        <span className="text-amber-800 dark:text-amber-300">{branchName}</span>
        {currentDistanceLabel && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            📍 {currentDistanceLabel}
          </span>
        )}
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
          {isCustomer ? (
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
          📍 {branchName} {currentDistanceLabel && `(${currentDistanceLabel})`}
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  {isCustomer ? 'Current dining location' : 'Assigned operating branch'}
                </span>
                {userLocation?.displayName && (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    📍 {userLocation.displayName}
                  </span>
                )}
                {currentDistanceLabel && (
                  <span className="rounded-md bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {currentDistanceLabel}
                  </span>
                )}
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
            {isCustomer ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-400/20"
              >
                🔄 Switch / Nearby Outlets
              </button>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300">
                🔒 Assigned Branch Context
              </span>
            )}
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

  if (!isCustomer) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50/90 px-3 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-200 ${className}`}
        title="Assigned Restaurant & Branch Location"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        <div className="flex items-center gap-1.5 font-medium">
          <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[120px] sm:max-w-[160px]">
            {restaurantName}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-[100px] sm:max-w-[140px]">
            {branchName}
          </span>
        </div>
        <span className="rounded-full bg-neutral-200/70 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
          🔒 Assigned
        </span>
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
          {currentDistanceLabel && (
            <span className="hidden sm:inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              📍 {currentDistanceLabel}
            </span>
          )}
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

      {/* Location picker for customers */}
      {isCustomer && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-neutral-700 bg-[#121716] p-4 text-white shadow-2xl sm:rounded-[28px] sm:p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-lg">⌖</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Nearby Dining Outlets</span>
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Select Nearby Restaurant & Branch</h3>
                <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-400">
                  Only outlets close to your current location are displayed so you get hot food & instant table booking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close location picker"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 text-lg text-neutral-400 transition hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => void handleLocationSearch(event.target.value)}
                    placeholder="Search city, area, or pincode"
                    aria-label="Search restaurant location"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                  />
                  {isSearching && <span className="absolute right-3 top-3 text-[10px] text-emerald-300">Searching...</span>}
                </div>
                <button
                  type="button"
                  onClick={() => void requestUserLocation()}
                  disabled={isLocating}
                  className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
                >
                  {isLocating ? 'Finding kitchens...' : '📍 Find kitchens near me'}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="relative z-20 mt-1 rounded-xl border border-neutral-700 bg-neutral-900 p-1 shadow-lg">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.latitude}-${result.longitude}-${index}`}
                      type="button"
                      onClick={() => {
                        setManualLocation(result);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white"
                    >
                      📍 {result.displayName || `${result.city || 'Selected area'}${result.state ? `, ${result.state}` : ''}`}
                    </button>
                  ))}
                </div>
              )}
              {locationError && <p className="mt-2 text-xs text-amber-300">{locationError}</p>}
              {userLocation && !isLocating && (
                <p className="mt-2 text-xs text-neutral-400">
                  Using {userLocation.displayName || userLocation.city || 'your selected location'}{userLocation.source === 'gps' ? ' from your device' : ' manually'}.
                </p>
              )}
            </div>

            {/* Nearby Restaurants */}
            {displayedRestaurants.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-300">
                    {onlyNearby ? 'Nearby Restaurants' : 'All Restaurants'}
                  </p>
                  <span className="text-xs text-neutral-500">{displayedRestaurants.length} available</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {displayedRestaurants.map((rest) => (
                    <button
                      key={rest._id}
                      type="button"
                      onClick={() => void switchRestaurant(rest._id)}
                      className={`flex min-h-[68px] items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        rest._id === restaurantId
                          ? 'border-amber-400 bg-amber-500/15 text-white shadow-sm'
                          : 'border-[#30261f] bg-[#1b1714] text-neutral-300 hover:border-amber-500/40 hover:bg-[#221c18]'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{rest.name}</p>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          {rest.distanceKm !== undefined
                            ? `📍 ${formatDistance(rest.distanceKm)}`
                            : 'Restaurant location'}
                        </p>
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

            {/* Branch Locations for Active Restaurant */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7c6b4]">
                  Branches for {restaurantName}
                </p>
                <span className="text-xs text-neutral-500">
                  {displayedBranches.length} {onlyNearby ? 'nearby' : 'total'} locations
                </span>
              </div>

              {isLoading ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center text-neutral-400">
                  <span className="mx-auto mb-3 block h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <p className="text-sm font-semibold">Loading locations...</p>
                </div>
              ) : displayedBranches.length === 0 ? (
                /* Empty state when no branch is nearby within maxRadiusKm */
                <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/60 p-6 text-center text-neutral-300">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-xl text-amber-400">
                    📍
                  </div>
                  <p className="text-sm font-bold text-white">No branches found within {maxRadiusKm} km</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    There are currently no active outlets within your chosen radius of {userLocation?.displayName || 'your location'}.
                  </p>

                  {nearestBranch && (
                    <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Nearest Available Branch:
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-white">{nearestBranch.name}</p>
                          <p className="text-xs text-neutral-400">
                            📍 {nearestBranch.address || 'Dining Hall'} • {formatDistance(nearestBranch.distanceKm)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            switchBranch(nearestBranch._id);
                            setModalOpen(false);
                          }}
                          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 shadow-sm"
                        >
                          Switch to this Branch
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setMaxRadiusKm(50)}
                      className="rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700"
                    >
                      Expand to 50 km
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlyNearby(false)}
                      className="rounded-xl bg-amber-400/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/30"
                    >
                      Show All Outlets
                    </button>
                  </div>
                </div>
              ) : (
                /* Nearby branches list */
                <div className="grid gap-3">
                  {displayedBranches.map((br, index) => {
                    const isSelected = br._id === branchId;
                    const isClosest = index === 0 && userLocation && br.distanceKm !== undefined;
                    return (
                      <button
                        key={br._id}
                        type="button"
                        onClick={() => {
                          switchBranch(br._id);
                          setModalOpen(false);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/40'
                            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-600 hover:bg-neutral-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                              <h4 className="font-bold text-white text-base">{br.name}</h4>
                              {isClosest && (
                                <span className="rounded-full bg-amber-400/25 border border-amber-400/40 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                                  ⭐ Closest Branch
                                </span>
                              )}
                              {br.distanceKm !== undefined && (
                                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                  📍 {formatDistance(br.distanceKm)}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#a0907e]">
                              📍 {br.address || 'Dining Hall & Takeaway Counter'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isSelected ? 'bg-emerald-400 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                              }`}
                            >
                              {isSelected ? '✓ Current' : 'Select'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
              {user?.role === 'platformAdmin' || user?.role === 'owner' ? (
                <Link
                  to={ROUTES.WORKSPACE}
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:underline"
                >
                  <span>🏢 Open Tenant Admin Console</span> &rarr;
                </Link>
              ) : (
                <span className="text-[11px] text-neutral-500">
                  {userLocation ? `Viewing outlets near ${userLocation.displayName || 'your location'}.` : 'Share location for proximity-based sorting.'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-md transition-all hover:bg-amber-300"
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
