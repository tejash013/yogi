import { useEffect, useState } from 'react';
import { Badge, Search, Table } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { usersApi, subscriptionsApi, tenantsApi } from '@/api/endpoints';
import { useOrderSyncStore, useAuthStore, useTenantStore, useToastStore } from '@/store';
import type { Column } from '@/components/ui';
import type { User, UserRole } from '@/types';

type UserRow = User & { _id?: string };

const roles: UserRole[] = ['customer', 'cashier', 'chef', 'manager', 'owner', 'platformAdmin'];
const statuses: NonNullable<User['status']>[] = ['active', 'inactive', 'suspended'];

const roleBadgeStyles: Record<string, string> = {
  platformAdmin: 'bg-purple-600 text-white font-black shadow-xs',
  owner: 'bg-indigo-600 text-white font-black shadow-xs',
  manager: 'bg-blue-600 text-white font-black shadow-xs',
  chef: 'bg-amber-600 text-white font-black shadow-xs',
  cashier: 'bg-emerald-600 text-white font-black shadow-xs',
  customer: 'bg-slate-700 text-white font-black shadow-xs',
};

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const syncVersion = useOrderSyncStore((state) => state.version);
  const currentRole = useAuthStore((state) => state.user?.role);
  const restaurants = useTenantStore((state) => state.availableRestaurants);
  const branches = useTenantStore((state) => state.allBranches);
  const showToast = useToastStore((state) => state.showToast);
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'manager' as 'owner' | 'manager',
    restaurantId: '',
    branchId: '',
  });

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await usersApi.getAll({ q: search, limit: 50 });
      setUsers(response.data.data.map((user) => ({
        ...user,
        id: user.id ?? String((user as any)._id ?? ''),
        branchId: user.branchId ? String(user.branchId) : undefined,
        restaurantId: user.restaurantId ? String(user.restaurantId) : undefined,
      })));
    } catch {
      setError('Unable to load user accounts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [search, syncVersion]);

  useEffect(() => {
    if (restaurants.length === 0 || branches.length === 0) {
      void useTenantStore.getState().loadTenants();
    }
  }, []);

  const updateAccess = async (
    user: UserRow,
    payload: {
      role?: UserRole;
      status?: User['status'];
      branch?: string;
      branchId?: string;
      restaurantId?: string;
    }
  ) => {
    const id = user.id || user._id;
    if (!id) return;
    setSavingId(id);
    setError('');
    try {
      const response = await usersApi.updateAccess(id, payload);
      const updated = response.data.data;
      setUsers((current) => current.map((item) => (item.id === id ? { ...item, ...updated, ...payload } : item)));

      // If user status is updated, also update associated restaurant status
      const userRestId = payload.restaurantId || user.restaurantId || (user as any).restaurantId || (user as any).restaurant?._id;
      if (payload.status && userRestId) {
        const isUserActive = payload.status === 'active';
        await Promise.all([
          tenantsApi.updateRestaurant(userRestId, { isActive: isUserActive }).catch(() => null),
          subscriptionsApi.updateRestaurant(userRestId, { status: isUserActive ? 'active' : 'suspended' }).catch(() => null),
        ]);
        await useTenantStore.getState().loadTenants().catch(() => null);
        showToast(
          `Account status updated. Associated restaurant is now ${isUserActive ? 'Active' : 'Paused'}.`,
          'success'
        );
      } else if (payload.branchId || payload.branch) {
        showToast('Assigned branch and restaurant updated successfully.', 'success');
      }

      useOrderSyncStore.getState().notifyResourceChange({
        type: 'update',
        resource: 'user',
        at: new Date().toISOString(),
      });
    } catch {
      setError('Access update failed. Your account may not have permission for this change.');
    } finally {
      setSavingId('');
    }
  };

  const createAdministrativeUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');
    try {
      await usersApi.create(createForm);
      setCreateForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'manager', restaurantId: '', branchId: '' });
      setShowCreate(false);
      await loadUsers();
    } catch {
      setCreateError('Unable to create the account. Check the tenant and branch assignment.');
    }
  };

  const visibleRoles: UserRole[] = currentRole === 'platformAdmin'
    ? roles
    : ['customer', 'cashier', 'chef'];

  const columns: Column<UserRow>[] = [
    {
      key: 'email',
      header: 'User Account',
      render: (user) => (
        <div className="py-1">
          <p className="font-black text-slate-900 dark:text-white text-sm">{user.firstName} {user.lastName}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role & Permissions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded-lg px-2.5 py-1 text-xs uppercase tracking-wider ${roleBadgeStyles[user.role] || 'bg-slate-600 text-white'}`}>
            {user.role}
          </span>
          <select
            value={user.role}
            disabled={savingId === user.id}
            onChange={(event) => void updateAccess(user, { role: event.target.value as UserRole })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            aria-label={`Role for ${user.email}`}
          >
            {visibleRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'neutral'}
            size="sm"
            className="font-black text-xs uppercase px-2.5 py-1"
          >
            {user.status ?? 'active'}
          </Badge>
          <select
            value={user.status ?? 'active'}
            disabled={savingId === user.id}
            onChange={(event) => void updateAccess(user, { status: event.target.value as User['status'] })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            aria-label={`Status for ${user.email}`}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Assigned Branch & Restaurant',
      render: (user) => {
        const currentBranchId =
          branches.find(
            (b) =>
              String(b._id) === String(user.branchId) ||
              (user.branch && b.name.toLowerCase() === user.branch.toLowerCase())
          )?._id ||
          (user.branchId ? String(user.branchId) : '');

        if (currentRole !== 'platformAdmin') {
          const matchedBranch = branches.find((b) => String(b._id) === currentBranchId);
          const matchedRest = matchedBranch
            ? restaurants.find((r) => String(r._id) === String(matchedBranch.restaurantId))
            : restaurants.find((r) => String(r._id) === String(user.restaurantId));
          return (
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                {matchedRest?.name || 'Restaurant'}:
              </span>{' '}
              {matchedBranch?.name || user.branch || 'Unassigned'}
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 min-w-[220px]">
            <select
              value={currentBranchId}
              disabled={savingId === (user.id || user._id)}
              onChange={(event) => {
                const newBranchId = event.target.value;
                if (!newBranchId) return;
                const selectedBranch = branches.find((b) => String(b._id) === newBranchId);
                if (!selectedBranch) return;
                void updateAccess(user, {
                  branchId: String(selectedBranch._id),
                  restaurantId: String(selectedBranch.restaurantId),
                  branch: selectedBranch.name,
                });
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              aria-label={`Assigned branch for ${user.email}`}
            >
              <option value="" disabled>
                -- Select Branch & Restaurant --
              </option>
              {currentBranchId && !branches.some((b) => String(b._id) === currentBranchId) && (
                <option value={currentBranchId}>
                  {user.branch || 'Current Branch'}
                </option>
              )}
              {restaurants.map((restaurant) => {
                const restBranches = branches.filter(
                  (b) => String(b.restaurantId) === String(restaurant._id)
                );
                if (restBranches.length === 0) return null;
                return (
                  <optgroup key={restaurant._id} label={restaurant.name}>
                    {restBranches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {restaurant.name} — {branch.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              {branches.filter((b) => !restaurants.some((r) => String(r._id) === String(b.restaurantId))).length > 0 && (
                <optgroup label="Other Branches">
                  {branches
                    .filter((b) => !restaurants.some((r) => String(r._id) === String(b.restaurantId)))
                    .map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access Control"
        description="Manage system permissions, account roles, subscription status, and branch assignments"
        actions={
          <div className="flex items-center gap-3">
            <Search placeholder="Search user accounts..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} />
            {currentRole === 'platformAdmin' ? (
              <button
                onClick={() => setShowCreate((open) => !open)}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white hover:bg-indigo-700 shadow-sm transition"
              >
                {showCreate ? 'Close Form' : '+ Create Admin'}
              </button>
            ) : null}
          </div>
        }
      />

      {showCreate && currentRole === 'platformAdmin' ? (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-md dark:border-indigo-900/60 dark:bg-indigo-950/40">
          <h3 className="mb-4 font-black text-lg text-slate-900 dark:text-white">Create Administrative Account</h3>
          <form onSubmit={createAdministrativeUser} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input required placeholder="First name" value={createForm.firstName} onChange={(event) => setCreateForm({ ...createForm, firstName: event.target.value })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <input placeholder="Last name" value={createForm.lastName} onChange={(event) => setCreateForm({ ...createForm, lastName: event.target.value })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <input required type="email" placeholder="Email address" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <input required placeholder="Phone number" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <input required type="password" minLength={6} placeholder="Temporary password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <select value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value as 'owner' | 'manager' })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
            </select>
            <select required value={createForm.restaurantId} onChange={(event) => setCreateForm({ ...createForm, restaurantId: event.target.value, branchId: '' })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">Select Restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
              ))}
            </select>
            <select required value={createForm.branchId} onChange={(event) => setCreateForm({ ...createForm, branchId: event.target.value })} className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">Select Branch Outlet</option>
              {branches.filter((branch) => String(branch.restaurantId) === createForm.restaurantId).map((branch) => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4 mt-2">
              <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-700 shadow-sm transition">
                Create Account
              </button>
              {createError ? <span className="text-xs font-bold text-red-600 dark:text-red-400">{createError}</span> : null}
            </div>
          </form>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 font-bold text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <Table columns={columns} data={users} isLoading={isLoading} />
        {!isLoading && users.length === 0 ? (
          <p className="p-8 text-center text-sm font-bold text-slate-500">No user accounts found matching your query.</p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void loadUsers()}
          disabled={isLoading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:border-indigo-600 hover:text-indigo-600 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh Accounts'}
        </button>
      </div>
    </div>
  );
}
