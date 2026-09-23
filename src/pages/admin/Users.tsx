import { useEffect, useState } from 'react';
import { Badge, Search, Table } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { usersApi } from '@/api';
import { useOrderSyncStore } from '@/store';
import { useAuthStore, useTenantStore } from '@/store';
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
      setUsers(response.data.data.map((user) => ({ ...user, id: user.id ?? String((user as any)._id ?? '') })));
    } catch {
      setError('Unable to load user accounts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [search, syncVersion]);

  const updateAccess = async (user: UserRow, payload: { role?: UserRole; status?: User['status']; branch?: string }) => {
    const id = user.id || user._id;
    if (!id) return;
    setSavingId(id);
    setError('');
    try {
      const response = await usersApi.updateAccess(id, payload);
      const updated = response.data.data;
      setUsers((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
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
      header: 'Assigned Branch',
      render: (user) => (
        <input
          defaultValue={user.branch ?? ''}
          placeholder="Unassigned"
          disabled={savingId === user.id}
          onBlur={(event) => {
            if (event.target.value !== (user.branch ?? '')) void updateAccess(user, { branch: event.target.value });
          }}
          className="w-36 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          aria-label={`Branch for ${user.email}`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access Control"
        description="Manage system permissions, account roles, active status, and branch assignments"
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
