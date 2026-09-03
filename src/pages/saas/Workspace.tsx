import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantsApi } from '@/api/endpoints';
import { useAuthStore, useTenantStore } from '@/store';
import { ROUTES } from '@/constants';
import type { Branch, Restaurant } from '@/types';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Workspace() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const {
    restaurantId: activeRestaurantId,
    branchId: activeBranchId,
    switchRestaurant: storeSwitchRestaurant,
    switchBranch: storeSwitchBranch,
    loadTenants,
  } = useTenantStore();

  const isPlatformAdmin = user?.role === 'platformAdmin';
  const isOwnerOrAdmin = user?.role === 'owner' || isPlatformAdmin || user?.role === 'manager';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(activeRestaurantId || '');
  const [restaurantName, setRestaurantName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const activeRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant._id === selectedRestaurant),
    [restaurants, selectedRestaurant],
  );

  useEffect(() => {
    tenantsApi.getRestaurants()
      .then((response) => {
        const items = response.data.data;
        setRestaurants(items);
        if (!selectedRestaurant && items.length > 0) {
          setSelectedRestaurant(activeRestaurantId || items[0]._id);
        }
      })
      .catch(() => setMessage('Workspace directory could not be loaded.'))
      .finally(() => setLoading(false));
  }, [activeRestaurantId, selectedRestaurant]);

  useEffect(() => {
    if (!selectedRestaurant) {
      setBranches([]);
      return;
    }
    setBranchesLoading(true);
    tenantsApi.getBranches(selectedRestaurant)
      .then((response) => setBranches(response.data.data))
      .catch(() => setMessage('Branches could not be loaded.'))
      .finally(() => setBranchesLoading(false));
  }, [selectedRestaurant]);

  async function createRestaurant(event: React.FormEvent) {
    event.preventDefault();
    if (!restaurantName.trim()) return;
    try {
      const response = await tenantsApi.createRestaurant({ name: restaurantName.trim(), slug: slugify(restaurantName) });
      setRestaurants((current) => [...current, response.data.data]);
      setSelectedRestaurant(response.data.data._id);
      void storeSwitchRestaurant(response.data.data._id);
      void loadTenants();
      setRestaurantName('');
      setMessage('Restaurant workspace created.');
    } catch {
      setMessage('Restaurant could not be created.');
    }
  }

  async function createBranch(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedRestaurant || !branchName.trim()) return;
    try {
      const response = await tenantsApi.createBranch(selectedRestaurant, {
        name: branchName.trim(),
        slug: slugify(branchName),
        address: branchAddress.trim() || undefined,
      });
      setBranches((current) => [...current, response.data.data]);
      storeSwitchBranch(response.data.data._id);
      void loadTenants();
      setBranchName('');
      setBranchAddress('');
      setMessage('Branch added and set as active.');
    } catch {
      setMessage('Branch could not be created.');
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-6 text-[#17211d] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] bg-[#173c35] px-6 py-8 text-white shadow-xl sm:px-10 lg:py-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[28px] border-[#d6e85e]/20" />
          <div className="absolute bottom-[-100px] right-48 h-48 w-48 rounded-full bg-[#df714c]/30 blur-2xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6e85e]">RestaurantOS / SaaS Workspace</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Multi-Tenant Management Console</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">Provision restaurants, organize branches, and switch active operating context across all screens seamlessly.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={isPlatformAdmin ? ROUTES.PLATFORM_ADMIN.DASHBOARD : ROUTES.ADMIN.DASHBOARD}
                className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isPlatformAdmin ? 'Platform Dashboard' : 'Manager Center'}
              </Link>
              {isPlatformAdmin && (
                <Link
                  to={ROUTES.PLATFORM_ADMIN.USERS}
                  className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-2xl border border-[#d6e85e]/40 bg-[#d6e85e] px-4 text-sm font-semibold text-[#173c35] transition hover:bg-[#e5f47d]"
                >
                  User Access
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate(ROUTES.AUTH.LOGIN);
                }}
                className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-red-500 hover:border-red-500"
                title="Sign out of workspace"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {message && <div className="mt-4 rounded-xl border border-[#d6e85e] bg-[#f8fbdc] px-4 py-3 text-sm text-[#42520f]">{message}</div>}

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Restaurant Workspaces */}
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-[#dfd9cc] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7d877f]">Restaurant directory</p>
                  <h2 className="mt-2 text-2xl font-semibold">Restaurants</h2>
                </div>
                <span className="rounded-full bg-[#e8f1d2] px-3 py-1 text-xs font-bold text-[#526000]">{restaurants.length} workspaces</span>
              </div>
              <div className="mt-5 space-y-2">
                {loading ? (
                  <p className="text-sm text-[#7d877f]">Loading workspaces...</p>
                ) : (
                  restaurants.map((restaurant) => (
                    <button
                      key={restaurant._id}
                      onClick={() => {
                        setSelectedRestaurant(restaurant._id);
                        void storeSwitchRestaurant(restaurant._id);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition flex items-center justify-between ${
                        selectedRestaurant === restaurant._id
                          ? 'border-[#173c35] bg-[#edf4e1] ring-1 ring-[#173c35]/20'
                          : 'border-[#ebe6dc] hover:border-[#aeb9a8]'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">{restaurant.name}</span>
                        <span className="mt-1 block text-xs text-[#7d877f]">Select to manage its branches</span>
                      </div>
                      {restaurant._id === activeRestaurantId && (
                        <span className="rounded-full bg-[#173c35] px-2.5 py-0.5 text-[10px] font-bold text-white">Active</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {isOwnerOrAdmin && (
              <form onSubmit={createRestaurant} className="rounded-[1.75rem] border border-[#dfd9cc] bg-[#fffaf0] p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#df714c]">Provision</p>
                <h2 className="mt-2 text-2xl font-semibold">New Restaurant</h2>
                <div className="mt-5 flex gap-2">
                  <input
                    value={restaurantName}
                    onChange={(event) => setRestaurantName(event.target.value)}
                    placeholder="Restaurant name (e.g. Skyline Dining)"
                    className="min-w-0 flex-1 rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173c35]"
                  />
                  <button className="rounded-xl bg-[#173c35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245a4e]">Create</button>
                </div>
              </form>
            )}
          </div>

          {/* Branch Network for Selected Restaurant */}
          <div className="rounded-[1.75rem] border border-[#dfd9cc] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#eee9df] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#df714c]">Branch network</p>
                <h2 className="mt-2 text-3xl font-semibold">{activeRestaurant?.name ?? 'Select a restaurant'}</h2>
              </div>
              <span className="rounded-full bg-[#f4f1ea] px-3 py-1.5 text-xs font-medium text-[#68736d]">{branches.length} branches</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {branchesLoading ? (
                <p className="text-sm text-[#7d877f]">Loading branches...</p>
              ) : branches.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#ddd3c4] p-5 text-sm text-[#7d877f]">No branches configured for this restaurant yet.</p>
              ) : branches.map((branch) => {
                const isActive = branch._id === activeBranchId;
                return (
                  <div
                    key={branch._id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isActive ? 'border-[#173c35] bg-[#edf4e1]/60 ring-1 ring-[#173c35]/20' : 'border-[#ebe6dc]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#173c35]' : 'bg-[#6fa56e]'}`} />
                      <span className="text-xs font-medium text-[#7d877f]">{isActive ? 'Current Active' : 'Available'}</span>
                    </div>
                    <h3 className="mt-4 font-bold text-base">{branch.name}</h3>
                    <p className="mt-1 text-sm text-[#7d877f]">{branch.address || 'Address not configured'}</p>
                    <button
                      type="button"
                      onClick={() => {
                        storeSwitchBranch(branch._id);
                        setMessage(`Switched active branch to ${branch.name}`);
                      }}
                      className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#173c35] text-white shadow-sm'
                          : 'border border-[#ddd3c4] bg-white text-[#173c35] hover:bg-[#f4f1ea]'
                      }`}
                    >
                      {isActive ? 'Current branch' : 'Set as active branch'}
                    </button>
                  </div>
                );
              })}
            </div>

            {isOwnerOrAdmin && (
              <form onSubmit={createBranch} className="mt-8 rounded-2xl bg-[#f4f1ea] p-5">
                <p className="text-sm font-semibold">Add Branch to {activeRestaurant?.name}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    value={branchName}
                    onChange={(event) => setBranchName(event.target.value)}
                    placeholder="Branch name (e.g. Airport Lounge)"
                    className="rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173c35]"
                  />
                  <input
                    value={branchAddress}
                    onChange={(event) => setBranchAddress(event.target.value)}
                    placeholder="Address / Terminal / Street"
                    className="rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173c35]"
                  />
                </div>
                <button
                  disabled={!selectedRestaurant}
                  className="mt-3 rounded-xl bg-[#df714c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c95f3c] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add Branch Location
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

