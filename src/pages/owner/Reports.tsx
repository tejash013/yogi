import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';

const reports = [
  { title: 'Monthly Financial Report', desc: 'Profit & loss, revenue breakdown', date: 'Mar 1, 2025' },
  { title: 'Sales Performance Report', desc: 'Item-wise sales analysis', date: 'Mar 1, 2025' },
  { title: 'Staff Performance Report', desc: 'Employee productivity metrics', date: 'Feb 28, 2025' },
  { title: 'Customer Analytics Report', desc: 'Customer behavior and trends', date: 'Feb 25, 2025' },
  { title: 'Inventory Report', desc: 'Stock levels and wastage', date: 'Feb 20, 2025' },
  { title: 'Tax Report', desc: 'Monthly tax summary', date: 'Feb 15, 2025' },
];

export default function OwnerReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate comprehensive business reports"
        actions={<Button>Generate New Report</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Total reports</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{reports.length}</p>
            </div>
            <Badge variant="primary" size="sm">
              Updated
            </Badge>
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Recent creation</p>
          <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">Mar 1, 2025</p>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Visibility</p>
          <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">Public</p>
        </Card>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="rounded-[1.75rem]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{report.title}</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{report.desc}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-400">Generated: {report.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="sm">Ready</Badge>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

