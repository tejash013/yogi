import { Button, Card, Table, Badge, Search } from '@/components/ui';
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
    <div>
      <PageHeader
        title="Employees"
        description="Manage your staff"
        actions={
          <div className="flex items-center gap-3">
            <Search placeholder="Search employees..." />
            <Button>Add Employee</Button>
          </div>
        }
      />
      <Card padding="none">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

