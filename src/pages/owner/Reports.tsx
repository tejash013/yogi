import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function OwnerReports() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate comprehensive business reports"
        actions={<Button>Generate New Report</Button>}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { title: 'Monthly Financial Report', desc: 'Profit & loss, revenue breakdown', date: 'Mar 1, 2025' },
          { title: 'Sales Performance Report', desc: 'Item-wise sales analysis', date: 'Mar 1, 2025' },
          { title: 'Staff Performance Report', desc: 'Employee productivity metrics', date: 'Feb 28, 2025' },
          { title: 'Customer Analytics Report', desc: 'Customer behavior and trends', date: 'Feb 25, 2025' },
          { title: 'Inventory Report', desc: 'Stock levels and wastage', date: 'Feb 20, 2025' },
          { title: 'Tax Report', desc: 'Monthly tax summary', date: 'Feb 15, 2025' },
        ].map((report) => (
          <Card key={report.title} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{report.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{report.desc}</p>
                <p className="mt-1 text-xs text-neutral-400">Generated: {report.date}</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

