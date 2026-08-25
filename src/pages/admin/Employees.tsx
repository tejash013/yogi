import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { employeesApi } from '@/api';
import type { Column } from '@/components/ui';
import type { Employee } from '@/types';

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
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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
      } catch (fetchError) {
        setError('Unable to load employees. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [search]);

  const activeCount = employees.filter((employee) => employee.isActive).length;
  const inactiveCount = employees.length - activeCount;
  const totalSalary = employees.reduce((sum, employee) => sum + (employee.salary ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your staff and track payroll status"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
            <Button>Add Employee</Button>
          </div>
        }
      />

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

