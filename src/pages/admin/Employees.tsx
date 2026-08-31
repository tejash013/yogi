import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader, TenantSelector } from '@/components/common';
import { employeesApi } from '@/api';
import { useTenantStore } from '@/store';
import type { Column } from '@/components/ui';
import type { Employee, UserRole } from '@/types';

const employeeRoles: UserRole[] = ['cashier', 'chef', 'manager', 'owner'];
const employeeShifts = ['morning', 'afternoon', 'evening', 'night'] as const;

type EmployeeRow = Employee & { _id?: string };

const columns: Column<EmployeeRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'shift', header: 'Shift' },
  { key: 'salary', header: 'Salary', render: (item) => `₹${item.salary.toFixed(2)}` },
  {
    key: 'isActive',
    header: 'Status',
    render: (item) => (
      <Badge variant={item.isActive ? 'success' : 'neutral'} size="sm">
        {item.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

export default function Employees() {
  const { branchId, currentBranch } = useTenantStore();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; role: UserRole; shift: typeof employeeShifts[number]; salary: string }>({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    shift: 'morning',
    salary: '0',
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await employeesApi.getAll({ q: search, limit: 50 });
      const items = response.data.data.map((item) => ({
        ...item,
        id: item.id ?? String((item as any)._id ?? ''),
      })) as EmployeeRow[];

      setEmployees(items);
    } catch {
      setError('Unable to load employees. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEmployees();
  }, [search, branchId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await employeesApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        shift: form.shift,
        salary: Number(form.salary || 0),
      });
      setForm({ name: '', email: '', phone: '', role: 'cashier', shift: 'morning', salary: '0' });
      setShowForm(false);
      await fetchEmployees();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create employee.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeCount = employees.filter((employee) => employee.isActive).length;
  const inactiveCount = employees.length - activeCount;
  const totalSalary = employees.reduce((sum, employee) => sum + (employee.salary ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Team"
        description={`Manage team members and shifts for ${currentBranch?.name || 'Main Hall'}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <TenantSelector variant="pill" />
            <Search
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
            <Button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close' : 'Add Employee'}</Button>
          </div>
        }
      />

      {showForm ? (
        <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
                  {employeeRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Shift</label>
                <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as typeof employeeShifts[number] })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
                  {employeeShifts.map((shift) => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Salary</label>
                <input type="number" min="0" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900" required />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save employee'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          {[
            { label: 'Total staff', value: totalSalary ? employees.length.toString() : '0' },
            { label: 'Active', value: activeCount.toString() },
            { label: 'Inactive', value: inactiveCount.toString() },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-neutral-50 p-5 text-neutral-900 dark:bg-neutral-900 dark:text-white">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {error ? (
        <Card className="rounded-[1.5rem] border-red-200 bg-red-50 text-red-800">
          <CardContent>{error}</CardContent>
        </Card>
      ) : null}

      <Card padding="none">
        <CardContent>
          <Table columns={columns} data={employees} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

