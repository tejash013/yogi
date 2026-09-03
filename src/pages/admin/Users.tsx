import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, Search, Table } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { usersApi } from '@/api';
import { useOrderSyncStore } from '@/store';
import { useAuthStore, useTenantStore } from '@/store';
import type { Column } from '@/components/ui';
import type { User, UserRole } from '@/types';

type UserRow = User & { _id?: string };

const roles: UserRole[] = ['customer', 'cashier', 'chef', 'manager', 'owner', 'platformAdmin'];
const statuses: NonNullable<User['status']>[] = ['active', 'inactive', 'suspended'];

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
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'manager' as 'owner' | 'manager', restaurantId: '', branchId: '' });

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
      header: 'Account',
      render: (user) => (
        <div>
          <p className="font-medium text-neutral-900 dark:text-white">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-neutral-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <select
          value={user.role}
          disabled={savingId === user.id}
          onChange={(event) => void updateAccess(user, { role: event.target.value as UserRole })}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          aria-label={`Role for ${user.email}`}
        >
          {visibleRoles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Badge variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'neutral'} size="sm">
            {user.status ?? 'active'}
          </Badge>
          <select
            value={user.status ?? 'active'}
            disabled={savingId === user.id}
            onChange={(event) => void updateAccess(user, { status: event.target.value as User['status'] })}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            aria-label={`Status for ${user.email}`}
          >
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (user) => (
        <input
          defaultValue={user.branch ?? ''}
          placeholder="Unassigned"
          disabled={savingId === user.id}
          onBlur={(event) => {
            if (event.target.value !== (user.branch ?? '')) void updateAccess(user, { branch: event.target.value });
          }}
          className="w-32 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          aria-label={`Branch for ${user.email}`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access"
        description="Manage account roles, status, and branch assignments"
        actions={<div className="flex items-center gap-3"><Search placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} />{currentRole === 'platformAdmin' ? <Button onClick={() => setShowCreate((open) => !open)}>{showCreate ? 'Close' : 'Create Admin'}</Button> : null}</div>}
      />
      {showCreate && currentRole === 'platformAdmin' ? (
        <Card className="border-secondary-200 dark:border-secondary-800">
          <CardContent>
            <form onSubmit={createAdministrativeUser} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input required placeholder="First name" value={createForm.firstName} onChange={(event) => setCreateForm({ ...createForm, firstName: event.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900" />
              <input placeholder="Last name" value={createForm.lastName} onChange={(event) => setCreateForm({ ...createForm, lastName: event.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900" />
              <input required type="email" placeholder="Email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900" />
              <input required placeholder="Phone" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900" />
              <input required type="password" minLength={6} placeholder="Temporary password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900" />
              <select value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value as 'owner' | 'manager' })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900"><option value="owner">owner</option><option value="manager">manager</option></select>
              <select required value={createForm.restaurantId} onChange={(event) => setCreateForm({ ...createForm, restaurantId: event.target.value, branchId: '' })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900"><option value="">Select restaurant</option>{restaurants.map((restaurant) => <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>)}</select>
              <select required value={createForm.branchId} onChange={(event) => setCreateForm({ ...createForm, branchId: event.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900"><option value="">Select branch</option>{branches.filter((branch) => String(branch.restaurantId) === createForm.restaurantId).map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}</select>
              <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4"><Button type="submit">Create account</Button>{createError ? <span className="text-sm text-red-600">{createError}</span> : null}</div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      {error ? <Card className="border-red-200 bg-red-50 text-red-800"><CardContent>{error}</CardContent></Card> : null}
      <Card padding="none">
        <CardContent>
          <Table columns={columns} data={users} isLoading={isLoading} />
          {!isLoading && users.length === 0 ? <p className="p-6 text-center text-sm text-neutral-500">No user accounts found.</p> : null}
        </CardContent>
      </Card>
      <Button variant="ghost" onClick={() => void loadUsers()} disabled={isLoading}>Refresh accounts</Button>
    </div>
  );
}
