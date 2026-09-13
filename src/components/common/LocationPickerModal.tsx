import { useEffect, useState } from 'react';
import { useTenantStore } from '@/store';
import { searchLocationQuery, type Coordinates } from '@/utils/geolocation';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationPickerModal({ isOpen, onClose }: LocationPickerModalProps) {
  const userLocation = useTenantStore((state) => state.userLocation);
  const isLocating = useTenantStore((state) => state.isLocating);
  const locationError = useTenantStore((state) => state.locationError);
  const onlyNearby = useTenantStore((state) => state.onlyNearby);
  const maxRadiusKm = useTenantStore((state) => state.maxRadiusKm);
  const requestUserLocation = useTenantStore((state) => state.requestUserLocation);
  const setManualLocation = useTenantStore((state) => state.setManualLocation);
  const loadTenants = useTenantStore((state) => state.loadTenants);
  const setOnlyNearby = useTenantStore((state) => state.setOnlyNearby);
  const setMaxRadiusKm = useTenantStore((state) => state.setMaxRadiusKm);
  const allBranches = useTenantStore((state) => state.allBranches);
  const branchId = useTenantStore((state) => state.branchId);
  const switchBranch = useTenantStore((state) => state.switchBranch);
  const isBranchInDeliveryRange = useTenantStore((state) => state.isBranchInDeliveryRange);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Coordinates[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let isCurrentSearch = true;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      void searchLocationQuery(query)
        .then((nextResults) => {
          if (isCurrentSearch) setResults(nextResults);
        })
        .catch(() => {
          if (isCurrentSearch) setResults([]);
        })
        .finally(() => {
          if (isCurrentSearch) setIsSearching(false);
        });
    }, 350);

    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  if (!isOpen) return null;

  const selectLocation = (location: Coordinates) => {
    setManualLocation(location);
    void loadTenants();
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-neutral-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
        className="w-full max-w-xl rounded-t-[28px] border border-neutral-700 bg-[#121716] p-5 text-white shadow-2xl sm:rounded-[28px] sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Location preferences</p>
            <h2 id="location-picker-title" className="mt-2 text-xl font-bold sm:text-2xl">Find kitchens near you</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-400">Enter your city or postal code to set your location area.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location panel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 text-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="City name (e.g., Bardoli, Surat)"
            aria-label="City name or postal code"
            className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
          <span className="flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-400 sm:min-w-32">
            {isSearching ? 'Searching...' : 'Search area'}
          </span>
        </div>

        {results.length > 0 && (
          <div className="mt-2 space-y-1 rounded-xl border border-neutral-700 bg-neutral-900 p-1">
            {results.map((result, index) => (
              <button
                key={`${result.latitude}-${result.longitude}-${index}`}
                type="button"
                onClick={() => selectLocation(result)}
                className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                📍 {result.displayName || `${result.city || 'Selected area'}${result.state ? `, ${result.state}` : ''}`}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-300">Your Current Location</p>
              <p className="mt-1 text-xs text-neutral-400">
                📍 {userLocation?.displayName || userLocation?.city || 'No location set'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void requestUserLocation()}
              disabled={isLocating}
              className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
            >
              {isLocating ? 'Finding kitchens...' : '📍 Auto-detect GPS'}
            </button>
          </div>
          {locationError && <p className="mt-2 text-xs text-amber-300">{locationError}</p>}
        </div>

        {/* Branch Outlets Listing with Delivery Area Enforcement */}
        {allBranches.length > 0 && (
          <div className="mt-4 border-t border-neutral-800 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Outlets & Ordering Status
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {allBranches.map((br) => {
                const inRange = isBranchInDeliveryRange(br);
                const isSelected = br._id === branchId;
                return (
                  <div
                    key={br._id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      isSelected
                        ? inRange
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-amber-500 bg-amber-950/20'
                        : 'border-neutral-800 bg-neutral-900/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{br.name}</span>
                        {inRange ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            ✓ Deliverable
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            👁 View Only (Out of area)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                        {br.address || br.slug}{' '}
                        {br.distanceKm !== undefined ? `• ${br.distanceKm.toFixed(1)} km away` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        switchBranch(br._id);
                        onClose();
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? inRange
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'bg-amber-500 text-neutral-950'
                          : inRange
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'bg-neutral-800 hover:bg-amber-950/50 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isSelected
                        ? inRange
                          ? 'Active'
                          : 'Viewing Only'
                        : inRange
                        ? 'Select to Order'
                        : 'Browse Menu'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4 text-xs">
          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={onlyNearby}
              onChange={(event) => setOnlyNearby(event.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500"
            />
            Only show outlets within delivery radius
          </label>
          {onlyNearby && (
            <div className="flex items-center gap-1.5">
              {[5, 15, 25, 50, 100].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => setMaxRadiusKm(radius)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                    maxRadiusKm === radius ? 'bg-emerald-400 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
