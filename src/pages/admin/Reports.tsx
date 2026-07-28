import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function AdminReports() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and view reports"
        actions={<Button>Generate Report</Button>}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {['Sales Report', 'Revenue Report', 'Expense Report', 'Customer Report'].map((report) => (
          <Card key={report} hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{report}</p>
                <p className="text-sm text-neutral-500">Last generated: Mar 20, 2025</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

