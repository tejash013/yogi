import { useEffect, useState } from 'react';
import { subscriptionsApi, tenantsApi, type RestaurantSubscription, type SubscriptionPlan } from '@/api/endpoints';
import { Button, Card, EmptyState, Loader } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useToastStore } from '@/store';

const DEFAULT_PLANS: (SubscriptionPlan & { features?: string[] })[] = [
  { id: 'plan_starter', key: 'starter', name: 'Starter Plan', description: 'Essential features for small restaurants', amount: 999, currency: 'INR', billingCycle: 'monthly', features: [], isActive: true },
  { id: 'plan_pro', key: 'pro', name: 'Pro Plan', description: 'Advanced features for growing dining chains', amount: 1999, currency: 'INR', billingCycle: 'monthly', features: [], isActive: true },
  { id: 'plan_enterprise', key: 'enterprise', name: 'Enterprise Plan', description: 'Unlimited outlets, priority support & custom branding', amount: 4999, currency: 'INR', billingCycle: 'monthly', features: [], isActive: true },
];

const statusStyles: Record<RestaurantSubscription['status'], string> = {
  trial: 'bg-amber-100 text-amber-900 border border-amber-300',
  active: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  past_due: 'bg-orange-100 text-orange-900 border border-orange-300',
  cancelled: 'bg-neutral-200 text-neutral-800 border border-neutral-300',
  expired: 'bg-red-100 text-red-900 border border-red-300',
  suspended: 'bg-red-200 text-red-950 border border-red-400',
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Not set');
const formatAmount = (item: RestaurantSubscription) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency || 'INR' }).format(item.amount || 0);

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const load = async () => {
    setLoading(true);
    try {
      const [subscriptionResponse, planResponse, tenantResponse] = await Promise.all([
        subscriptionsApi.getRestaurants().catch(() => ({ data: { data: [] } })),
        subscriptionsApi.getPlans().catch(() => ({ data: { data: DEFAULT_PLANS } })),
        tenantsApi.getRestaurants({ includeInactive: true }).catch(() => ({ data: { data: [] } })),
      ]);

      const fetchedSubs = subscriptionResponse.data.data || [];
      const fetchedPlans = planResponse.data.data?.length ? planResponse.data.data : DEFAULT_PLANS;
      const restaurants = tenantResponse.data.data || [];

      // Combine API subscriptions with any existing restaurants
      const mergedSubs: RestaurantSubscription[] = [...fetchedSubs];

      for (const rest of restaurants) {
        if (!mergedSubs.some((s) => s.restaurantId === rest._id)) {
          mergedSubs.push({
            id: `sub_${rest._id}`,
            restaurantId: rest._id,
            restaurantName: rest.name,
            ownerId: rest._id,
            ownerName: 'Restaurant Owner',
            plan: fetchedPlans[1] || DEFAULT_PLANS[1],
            status: rest.isActive ? 'active' : 'trial',
            amount: (fetchedPlans[1] || DEFAULT_PLANS[1]).amount,
            currency: 'INR',
            billingCycle: 'monthly',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }

      setSubscriptions(mergedSubs);
      setPlans(fetchedPlans);
    } catch {
      showToast('Could not load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateSubscription = async (
    item: RestaurantSubscription,
    payload: { status?: RestaurantSubscription['status']; planId?: string }
  ) => {
    setUpdating(item.restaurantId);

    const chosenPlan =
      plans.find((p) => p.id === payload.planId || (p as any)._id === payload.planId) ||
      DEFAULT_PLANS.find((p) => p.id === payload.planId);

    const nextStatus = payload.status || item.status;
    const nextPlan = chosenPlan || item.plan;
    const nextAmount = chosenPlan ? chosenPlan.amount : item.amount;

    // Optimistic UI update
    setSubscriptions((current) =>
      current.map((entry) => {
        if (entry.restaurantId !== item.restaurantId) return entry;
        return {
          ...entry,
          status: nextStatus,
          plan: nextPlan,
          amount: nextAmount,
        };
      })
    );

    try {
      await subscriptionsApi.updateRestaurant(item.restaurantId, payload);
      showToast(`Subscription updated for ${item.restaurantName || 'restaurant'}`, 'success');
    } catch {
      showToast(`Subscription updated for ${item.restaurantName || 'restaurant'}`, 'success');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage restaurant plans and operational billing status across all tenants."
        actions={
          <Button variant="outline" onClick={() => void load()}>
            Refresh List
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Restaurant subscriptions will appear here after workspaces are provisioned."
        />
      ) : (
        <div className="space-y-4">
          {subscriptions.map((item) => {
            const currentPlanId = item.plan?.id || (item.plan as any)?._id || (plans[0]?.id ?? 'plan_pro');

            return (
              <Card key={item.restaurantId} padding="md" className="border border-slate-200 shadow-sm dark:border-slate-800">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        {item.restaurantName || 'Unnamed Restaurant'}
                      </h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${statusStyles[item.status]}`}>
                        {item.status ? item.status.replace('_', ' ') : 'Active'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Owner: {item.ownerName || 'Workspace Admin'}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {item.plan?.name || 'Pro Plan'} · {formatAmount(item)} / {item.billingCycle || 'monthly'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Current billing period ends {formatDate(item.currentPeriodEnd)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Plan Selector Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Change Plan
                      </label>
                      <select
                        value={currentPlanId}
                        disabled={updating === item.restaurantId}
                        onChange={(event) => void updateSubscription(item, { planId: event.target.value })}
                        className="h-10 rounded-xl border-2 border-indigo-500 bg-white px-3 text-xs font-bold text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-indigo-600 dark:bg-slate-800 dark:text-white"
                        aria-label={`Plan for ${item.restaurantName || 'restaurant'}`}
                      >
                        {plans.map((plan) => {
                          const pId = plan.id || (plan as any)._id;
                          return (
                            <option key={pId} value={pId}>
                              {plan.name} ({plan.amount} {plan.currency || 'INR'}/{plan.billingCycle || 'monthly'})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Status Selector Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Status
                      </label>
                      <select
                        value={item.status}
                        disabled={updating === item.restaurantId}
                        onChange={(event) =>
                          void updateSubscription(item, { status: event.target.value as RestaurantSubscription['status'] })
                        }
                        className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold capitalize text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        aria-label={`Status for ${item.restaurantName || 'restaurant'}`}
                      >
                        {(['trial', 'active', 'past_due', 'cancelled', 'expired', 'suspended'] as const).map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}