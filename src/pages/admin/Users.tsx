import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, Search, Table } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { usersApi } from '@/api';
import type { Column } from '@/components/ui';
import type { User, UserRole } from '@/types';

type UserRow = User & { _id?: string };

const roles: UserRole[] = ['customer', 'cashier', 'chef', 'manager', 'owner', 'admin'];
const statuses: NonNullable<User['status']>[] = ['active', 'inactive', 'suspended'];

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

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
  }, [search]);

  const updateAccess = async (user: UserRow, payload: { role?: UserRole; status?: User['status']; branch?: string }) => {
    const id = user.id || user._id;
    if (!id) return;
    setSavingId(id);
    setError('');
    try {
      const response = await usersApi.updateAccess(id, payload);
      const updated = response.data.data;
      setUsers((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    } catch {
      setError('Access update failed. Your account may not have permission for this change.');
    } finally {
      setSavingId('');
    }
  };

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
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
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
        actions={<Search placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} />}
      />
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
