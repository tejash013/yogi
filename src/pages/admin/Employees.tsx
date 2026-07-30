import { Button, Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
import type { Column } from '@/components/ui';

interface EmployeeRow {
  name: string;
  role: string;
  shift: string;
  salary: number;
  status: string;
}

const data: EmployeeRow[] = [
  { name: 'Carlos Rodriguez', role: 'Chef', shift: 'Morning', salary: 4500, status: 'active' },
  { name: 'Emily Brown', role: 'Cashier', shift: 'Afternoon', salary: 3200, status: 'active' },
  { name: 'Alex Kim', role: 'Server', shift: 'Evening', salary: 2800, status: 'active' },
  { name: 'Sarah Wilson', role: 'Manager', shift: 'Morning', salary: 5500, status: 'inactive' },
];

const columns: Column<EmployeeRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'shift', header: 'Shift' },
  { key: 'salary', header: 'Salary', render: (item) => `$${item.salary.toFixed(2)}` },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <Badge variant={item.status === 'active' ? 'success' : 'neutral'} size="sm">
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Badge>
    ),
  },
];

export default function Employees() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your staff and track payroll status"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search placeholder="Search employees..." />
            <Button>Add Employee</Button>
          </div>
        }
      />

      <Card className="rounded-[1.5rem] border-neutral-200 dark:border-neutral-700">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          {[
            { label: 'Total staff', value: '4' },
            { label: 'On duty', value: '3' },
            { label: 'Off duty', value: '1' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-neutral-50 p-5 text-neutral-900 dark:bg-neutral-900 dark:text-white">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

