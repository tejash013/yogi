import { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { settingsApi } from '@/api';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptyHours = Object.fromEntries(days.map((day) => [day, { status: 'open', open: '09:00', close: '22:00' }])) as Record<string, { status: 'open' | 'closed'; open: string; close: string }>;

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: 'RestaurantOS',
    email: 'contact@restaurantos.com',
    phone: '+1-555-0000',
    address: '123 Main Street, New York, NY 10001',
    businessHours: emptyHours,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await settingsApi.get().catch(() => ({ data: { data: {} as Record<string, any> } }));
        const data = (response?.data?.data ?? {}) as Record<string, any>;
        const nextHours = { ...emptyHours, ...(data.businessHours ?? {}) } as Record<string, { status: 'open' | 'closed'; open: string; close: string }>;
        setForm({
          name: String(data.name ?? 'RestaurantOS'),
          email: String(data.email ?? 'contact@restaurantos.com'),
          phone: String(data.phone ?? '+1-555-0000'),
          address: String(data.address ?? '123 Main Street, New York, NY 10001'),
          businessHours: nextHours,
        });
      } catch {
        setMessage('Unable to load restaurant settings.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const businessHourEntries = useMemo(() => Object.entries(form.businessHours), [form.businessHours]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      await settingsApi.update({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        businessHours: form.businessHours,
      });
      setMessage('Settings saved successfully.');
    } catch {
      setMessage('Unable to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage restaurant settings" />

      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="overflow-hidden rounded-[30px] border-[#efe4d7] bg-[#fffdfb] p-0 shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(223,180,112,0.18),_transparent_50%)] p-6">
            <h3 className="mb-5 text-xl font-semibold text-neutral-900 dark:text-white">Restaurant profile</h3>
            <div className="space-y-4">
              <Input label="Restaurant Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} disabled={isLoading} />
              <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} disabled={isLoading} />
              <Input label="Phone" type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} disabled={isLoading} />
              <Input label="Address" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} disabled={isLoading} />
            </div>
          </div>
        </Card>

        <Card className="rounded-[30px] border-[#efe4d7] bg-[#fffdfb] p-6 shadow-[0_20px_60px_rgba(85,68,44,0.04)] dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="mb-5 text-xl font-semibold text-neutral-900 dark:text-white">Business hours</h3>
          <div className="space-y-4">
            {businessHourEntries.map(([day, hours]) => (
              <div key={day} className="grid gap-3 rounded-[22px] border border-[#f0e4d7] bg-[#f9f5f1] p-3 md:grid-cols-[140px_120px_120px_40px_120px] md:items-center dark:border-neutral-700 dark:bg-neutral-800">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{day}</span>
                <Select
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                  value={hours.status}
                  onChange={(value) => setForm((current) => ({
                    ...current,
                    businessHours: {
                      ...current.businessHours,
                      [day]: { ...current.businessHours[day], status: value as unknown as 'open' | 'closed' },
                    },
                  }))}
                />
                <Input type="time" value={hours.open} onChange={(event) => setForm((current) => ({
                  ...current,
                  businessHours: {
                    ...current.businessHours,
                    [day]: { ...current.businessHours[day], open: event.target.value },
                  },
                }))} disabled={hours.status === 'closed'} />
                <span className="hidden text-center text-neutral-500 md:block">to</span>
                <Input type="time" value={hours.close} onChange={(event) => setForm((current) => ({
                  ...current,
                  businessHours: {
                    ...current.businessHours,
                    [day]: { ...current.businessHours[day], close: event.target.value },
                  },
                }))} disabled={hours.status === 'closed'} />
              </div>
            ))}
          </div>
        </Card>

        {message ? <p className="text-sm text-neutral-700 dark:text-neutral-200">{message}</p> : null}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setForm({ name: 'RestaurantOS', email: 'contact@restaurantos.com', phone: '+1-555-0000', address: '123 Main Street, New York, NY 10001', businessHours: emptyHours })}>Reset</Button>
          <Button onClick={() => void handleSave()} disabled={isSaving || isLoading}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </div>
    </div>
  );
}

