import { Card, Button, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';

export default function AdminSettings() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage restaurant settings" />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Restaurant Info</h3>
          <div className="space-y-4">
            <Input label="Restaurant Name" defaultValue="RestaurantOS" />
            <Input label="Email" type="email" defaultValue="contact@restaurantos.com" />
            <Input label="Phone" type="tel" defaultValue="+1-555-0000" />
            <Input label="Address" defaultValue="123 Main Street, New York, NY 10001" />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Business Hours</h3>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-neutral-700 dark:text-neutral-300">{day}</span>
                <Select
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                  defaultValue="open"
                />
                <Input type="time" defaultValue="09:00" />
                <span className="text-neutral-500">to</span>
                <Input type="time" defaultValue="22:00" />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset</Button>
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}

