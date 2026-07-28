const fs = require('fs');
const content = "import { Button, Card, Table, Badge, Search, Select } from '@/components/ui';\n\
import { PageHeader } from '@/components/common';\n\
import type { Column } from '@/components/ui';\n\
\n\
interface PaymentRow {\n\
  id: string;\n\
  order: string;\n\
  customer: string;\n\
  amount: number;\n\
  method: string;\n\
  status: string;\n\
  date: string;\n\
}\n\
\n\
const data: PaymentRow[] = [\n\
  { id: '1', order: 'ORD-001', customer: 'John Doe', amount: 38.85, method: 'Cash', status: 'completed', date: '2025-03-20' },\n\
  { id: '2', order: 'ORD-002', customer: 'Jane Smith', amount: 41.41, method: 'Card', status: 'completed', date: '2025-03-20' },\n\
  { id: '3', order: 'ORD-003', customer: 'Mike Johnson', amount: 25.89, method: 'UPI', status: 'pending', date: '2025-03-19' },\n\
  { id: '4', order: 'ORD-004', customer: 'Sarah Wilson', amount: 52.30, method: 'Online', status: 'failed', date: '2025-03-18' },\n\
];\n\
\n\
const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {\n\
  completed: 'success',\n\
  pending: 'warning',\n\
  failed: 'error',\n\
  refunded: 'info',\n\
};\n\
\n\
const columns: Column<PaymentRow>[] = [\n\
  { key: 'order', header: 'Order' },\n\
  { key: 'customer', header: 'Customer' },\n\
  { key: 'amount', header: 'Amount', render: (item: PaymentRow) => '$' + item.amount.toFixed(2) },\n\
  { key: 'method', header: 'Method' },\n\
  {\n\
    key: 'status',\n\
    header: 'Status',\n\
    render: (item: PaymentRow) => (\n\
      <Badge variant={statusColors[item.status] || 'neutral'} size='sm'>\n\
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}\n\
      </Badge>\n\
    ),\n\
  },\n\
  { key: 'date', header: 'Date' },\n\
];\n\
\n\
export default function Payments() {\n\
  return (\n\
    <div>\n\
      <PageHeader\n\
        title='Payments'\n\
        description='Track and manage payments'\n\
        actions={\n\
          <div className='flex items-center gap-3'>\n\
            <Search placeholder='Search payments...' />\n\
            <Select\n\
              options={[\n\
                { value: 'all', label: 'All Methods' },\n\
                { value: 'cash', label: 'Cash' },\n\
                { value: 'card', label: 'Card' },\n\
                { value: 'upi', label: 'UPI' },\n\
                { value: 'online', label: 'Online' },\n\
              ]}\n\
              placeholder='Filter'\n\
            />\n\
          </div>\n\
        }\n\
      />\n\
      <Card padding='none'>\n\
        <Table columns={columns} data={data} />\n\
      </Card>\n\
    </div>\n\
  );\n\
}\n";

fs.writeFileSync('src/pages/cashier/Payments.tsx', content, 'utf8');
const stat = fs.statSync('src/pages/cashier/Payments.tsx');
console.log('Written successfully:', stat.size, 'bytes');
