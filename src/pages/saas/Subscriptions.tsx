import { useEffect, useState } from 'react';
import { subscriptionsApi, type RestaurantSubscription, type SubscriptionPlan } from '@/api/endpoints';
import { Button, Card, EmptyState, Loader } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useToastStore } from '@/store';

const statusStyles: Record<RestaurantSubscription['status'], string> = {
  trial: 'bg-amber-100 text-amber-800',
  active: 'bg-emerald-100 text-emerald-800',
  past_due: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-neutral-200 text-neutral-700',
  expired: 'bg-red-100 text-red-800',
  suspended: 'bg-red-200 text-red-900',
};

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Not set';
const formatAmount = (item: RestaurantSubscription) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency || 'INR' }).format(item.amount);

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const load = async () => {
    setLoading(true);
    try {
      const [subscriptionResponse, planResponse] = await Promise.all([
        subscriptionsApi.getRestaurants(),
        subscriptionsApi.getPlans(),
      ]);
      setSubscriptions(subscriptionResponse.data.data || []);
      setPlans(planResponse.data.data || []);
    } catch {
      showToast('Could not load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const updateSubscription = async (item: RestaurantSubscription, payload: { status?: RestaurantSubscription['status']; planId?: string }) => {
    setUpdating(item.restaurantId);
    try {
      const response = await subscriptionsApi.updateRestaurant(item.restaurantId, payload);
      setSubscriptions((current) => current.map((entry) => entry.restaurantId === item.restaurantId ? response.data.data : entry));
      showToast('Subscription updated', 'success');
    } catch {
      showToast('Subscription update failed', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Manage restaurant billing status without restricting product features." actions={<Button variant="outline" onClick={() => void load()}>Refresh</Button>} />
      {loading ? <div className="flex justify-center py-16"><Loader /></div> : subscriptions.length === 0 ? <EmptyState title="No restaurants yet" description="Restaurant subscriptions will appear here after an owner is created." /> : (
        <div className="space-y-4">
          {subscriptions.map((item) => (
            <Card key={item.restaurantId} padding="md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{item.restaurantName || 'Unnamed restaurant'}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status]}`}>{item.status.replace('_', ' ')}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">Owner: {item.ownerName || 'Owner not assigned'}</p>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{item.plan?.name || 'No plan'} · {formatAmount(item)} / {item.billingCycle}</p>
                  <p className="mt-1 text-xs text-neutral-500">Current period ends {formatDate(item.currentPeriodEnd)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={item.plan?.id || ''}
                    disabled={updating === item.restaurantId || plans.length === 0}
                    onChange={(event) => void updateSubscription(item, { planId: event.target.value })}
                    className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    aria-label={`Plan for ${item.restaurantName || 'restaurant'}`}
                  >
                    <option value="">Select plan</option>
                    {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} ({plan.amount} {plan.currency}/{plan.billingCycle})</option>)}
                  </select>
                  <select
                    value={item.status}
                    disabled={updating === item.restaurantId}
                    onChange={(event) => void updateSubscription(item, { status: event.target.value as RestaurantSubscription['status'] })}
                    className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm capitalize dark:border-neutral-700 dark:bg-neutral-800"
                    aria-label={`Status for ${item.restaurantName || 'restaurant'}`}
                  >
                    {(['trial', 'active', 'past_due', 'cancelled', 'expired', 'suspended'] as const).map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}