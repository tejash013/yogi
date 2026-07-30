import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';

const reports = [
  { title: 'Sales Report', date: 'Mar 20, 2025', summary: 'Revenue and orders overview' },
  { title: 'Revenue Report', date: 'Mar 19, 2025', summary: 'Income breakdown by channel' },
  { title: 'Expense Report', date: 'Mar 18, 2025', summary: 'Cost and spend analysis' },
  { title: 'Customer Report', date: 'Mar 17, 2025', summary: 'Visits, retention, and feedback' },
];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and view reports"
        actions={<Button>Generate Report</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} className="rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900">
            <CardHeader>
              <div>
                <p className="text-base font-semibold text-neutral-900 dark:text-white">{report.title}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Last generated: {report.date}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{report.summary}</p>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

