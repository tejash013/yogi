import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantsApi } from '@/api/endpoints';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/constants';
import type { Branch, Restaurant } from '@/types';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Workspace() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isPlatformAdmin = user?.role === 'platformAdmin';
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(isPlatformAdmin);

  const activeRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant._id === selectedRestaurant),
    [restaurants, selectedRestaurant],
  );

  useEffect(() => {
    if (!isPlatformAdmin) return;
    tenantsApi.getRestaurants()
      .then((response) => {
        const items = response.data.data;
        setRestaurants(items);
        setSelectedRestaurant(items[0]?._id ?? '');
      })
      .catch(() => setMessage('Workspace directory could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isPlatformAdmin]);

  useEffect(() => {
    if (!selectedRestaurant || !isPlatformAdmin) return;
    tenantsApi.getBranches(selectedRestaurant)
      .then((response) => setBranches(response.data.data))
      .catch(() => setMessage('Branches could not be loaded.'));
  }, [isPlatformAdmin, selectedRestaurant]);

  async function createRestaurant(event: React.FormEvent) {
    event.preventDefault();
    if (!restaurantName.trim()) return;
    try {
      const response = await tenantsApi.createRestaurant({ name: restaurantName.trim(), slug: slugify(restaurantName) });
      setRestaurants((current) => [...current, response.data.data]);
      setSelectedRestaurant(response.data.data._id);
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
      setBranchName('');
      setBranchAddress('');
      setMessage('Branch added to the workspace.');
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
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6e85e]">RestaurantOS / workspace</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Your restaurant network, in one view.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">Provision restaurants, organize branches, and keep every operational workspace separated by design.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Signed in as</p>
                <p className="mt-1 font-medium">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}</p>
                <p className="text-sm text-[#d6e85e]">{user?.role === 'platformAdmin' ? 'Platform administrator' : 'Restaurant workspace'}</p>
              </div>
              <Link
                to={ROUTES.PLATFORM_ADMIN.DASHBOARD}
                className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Platform Dashboard
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

        {!isPlatformAdmin ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[1.75rem] border border-[#dfd9cc] bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#df714c]">Active workspace</p>
              <h2 className="mt-3 text-3xl font-semibold">Restaurant operations</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#68736d]">Your account is connected to one protected restaurant branch. Operations, inventory, invoices, and reports stay within that workspace.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f4f1ea] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[#7d877f]">Restaurant ID</p><p className="mt-2 truncate font-mono text-sm">{user?.restaurantId ?? 'Not assigned'}</p></div>
                <div className="rounded-2xl bg-[#f4f1ea] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[#7d877f]">Branch ID</p><p className="mt-2 truncate font-mono text-sm">{user?.branchId ?? 'Not assigned'}</p></div>
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-[#d6e85e] p-7 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#526000]">Workspace health</p><p className="mt-8 text-5xl font-semibold">100%</p><p className="mt-2 text-sm text-[#526000]">Tenant context active</p><div className="mt-8 h-2 rounded-full bg-[#b6c83f]"><div className="h-2 w-full rounded-full bg-[#173c35]" /></div></div>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-[#dfd9cc] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7d877f]">Directory</p><h2 className="mt-2 text-2xl font-semibold">Restaurants</h2></div><span className="rounded-full bg-[#e8f1d2] px-3 py-1 text-xs font-bold text-[#526000]">{restaurants.length} workspaces</span></div>
                <div className="mt-5 space-y-2">{loading ? <p className="text-sm text-[#7d877f]">Loading workspaces...</p> : restaurants.map((restaurant) => <button key={restaurant._id} onClick={() => setSelectedRestaurant(restaurant._id)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedRestaurant === restaurant._id ? 'border-[#173c35] bg-[#edf4e1]' : 'border-[#ebe6dc] hover:border-[#aeb9a8]'}`}><span className="block font-medium">{restaurant.name}</span><span className="mt-1 block text-xs text-[#7d877f]">/{restaurant.slug}</span></button>)}</div>
              </div>
              <form onSubmit={createRestaurant} className="rounded-[1.75rem] border border-[#dfd9cc] bg-[#fffaf0] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#df714c]">Provision</p><h2 className="mt-2 text-2xl font-semibold">New restaurant</h2><div className="mt-5 flex gap-2"><input value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} placeholder="Restaurant name" className="min-w-0 flex-1 rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173c35]" /><button className="rounded-xl bg-[#173c35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245a4e]">Create</button></div></form>
            </div>
            <div className="rounded-[1.75rem] border border-[#dfd9cc] bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-4 border-b border-[#eee9df] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#df714c]">Branch network</p><h2 className="mt-2 text-3xl font-semibold">{activeRestaurant?.name ?? 'Select a restaurant'}</h2></div><span className="rounded-full bg-[#f4f1ea] px-3 py-1.5 text-xs font-medium text-[#68736d]">{branches.length} branches</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{branches.map((branch) => <div key={branch._id} className="rounded-2xl border border-[#ebe6dc] p-4"><div className="flex items-center justify-between"><span className="h-2.5 w-2.5 rounded-full bg-[#6fa56e]" /><span className="text-xs text-[#7d877f]">Active</span></div><h3 className="mt-5 font-semibold">{branch.name}</h3><p className="mt-1 text-sm text-[#7d877f]">{branch.address || 'Address not configured'}</p><p className="mt-4 font-mono text-[11px] text-[#a0a79f]">{branch._id}</p></div>)}</div><form onSubmit={createBranch} className="mt-8 rounded-2xl bg-[#f4f1ea] p-5"><p className="text-sm font-semibold">Add branch to this restaurant</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="Branch name" className="rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173c35]" /><input value={branchAddress} onChange={(event) => setBranchAddress(event.target.value)} placeholder="Address (optional)" className="rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173c35]" /></div><button disabled={!selectedRestaurant} className="mt-3 rounded-xl bg-[#df714c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c95f3c] disabled:cursor-not-allowed disabled:opacity-40">Add branch</button></form></div>
          </section>
        )}
      </div>
    </main>
  );
}
