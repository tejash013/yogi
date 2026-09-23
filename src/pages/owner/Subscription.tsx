import { useEffect, useState } from 'react';
import { subscriptionsApi, type RestaurantSubscription } from '@/api/endpoints';
import { Card, Loader } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useToastStore } from '@/store';

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Not set';

export default function OwnerSubscription() {
  const [subscription, setSubscription] = useState<RestaurantSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    subscriptionsApi.getCurrent()
      .then((response) => setSubscription(response.data.data))
      .catch(() => showToast('Could not load subscription details', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription" description="Your plan and billing period. All RestaurantOS features remain available." />
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : subscription ? (
        <Card padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Current plan</p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{subscription.plan?.name || 'RestaurantOS Pro'}</h2>
              <p className="mt-1 text-sm text-neutral-500">{subscription.plan?.description || 'Full access to restaurant operations, KDS, POS & digital menu.'}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold capitalize text-emerald-800">{subscription.status ? subscription.status.replace('_', ' ') : 'Active'}</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Detail label="Amount" value={`${subscription.amount || 0} ${subscription.currency || 'INR'} / ${subscription.billingCycle || 'monthly'}`} />
            <Detail label="Period started" value={formatDate(subscription.currentPeriodStart)} />
            <Detail label="Next renewal" value={formatDate(subscription.currentPeriodEnd)} />
          </div>
          <p className="mt-8 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">Subscription status is managed by the platform team. Your restaurant can continue using the complete product while billing is handled.</p>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Standard Active</span>
              <h2 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">RestaurantOS Workspace Plan</h2>
              <p className="mt-1 text-sm text-neutral-500">Full operational features active across all your branch outlets.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p><p className="mt-1 font-semibold text-neutral-900 dark:text-white">{value}</p></div>;
}