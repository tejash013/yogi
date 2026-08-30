import { useEffect, useMemo, useState } from 'react';
import { Card, EmptyState } from '@/components/ui';
import { RewardCard } from '@/components/customer';
import { ordersApi } from '@/api';

export default function Rewards() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.getUserOrders()
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setOrders(list);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [orders]);

  // Dynamic point balance: 1 point per ₹10 spent
  const currentPoints = useMemo(() => {
    return Math.floor(totalSpent / 10);
  }, [totalSpent]);

  const tier = currentPoints >= 2000 ? 'Platinum' : currentPoints >= 1000 ? 'Gold' : currentPoints >= 300 ? 'Silver' : 'Bronze';
  const nextTierPoints = currentPoints >= 2000 ? 5000 : currentPoints >= 1000 ? 2000 : currentPoints >= 300 ? 1000 : 300;
  const nextTierName = currentPoints >= 2000 ? 'VIP Elite' : currentPoints >= 1000 ? 'Platinum' : currentPoints >= 300 ? 'Gold' : 'Silver';
  const tierProgress = Math.min(100, Math.round((currentPoints / nextTierPoints) * 100));

  const rewards = [
    { points: 50, reward: '₹50 Off', label: 'Applicable on orders above ₹300' },
    { points: 100, reward: 'Free Beverage', label: 'Any specialty drink on the house' },
    { points: 250, reward: '₹250 Off', label: 'Applicable on orders above ₹800' },
    { points: 500, reward: 'Chef Special Combo', label: 'Free starter & dessert combo' },
  ];

  // Dynamic history from orders
  const history = useMemo(() => {
    return orders.map((o) => {
      const pts = Math.max(1, Math.floor(Number(o.total || 0) / 10));
      const orderNum = o.orderNumber || `ORD-${String(o._id || o.id).slice(-6).toUpperCase()}`;
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Recent';
      return {
        date: d,
        description: `Order #${orderNum}`,
        points: pts,
      };
    });
  }, [orders]);

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Rewards & Loyalty Program</h1>

      {/* Points Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg">
        <div className="relative">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-sm font-medium text-white/80">Your Points Balance</p>
            <p className="mt-1 text-5xl font-extrabold">{isLoading ? '...' : currentPoints.toLocaleString()}</p>
            <p className="mt-1 text-sm text-white/80">Earn 1 loyalty point for every ₹10 spent</p>

            {/* Tier Progress */}
            <div className="mt-6">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-white/80">
                <span>✦ Current Tier: {tier}</span>
                <span>Next: {nextTierName}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-white/80">
                {Math.max(0, nextTierPoints - currentPoints).toLocaleString()} points needed to reach {nextTierName} tier
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Available Rewards */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
          Redeemable Rewards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.points}
              {...reward}
              currentPoints={currentPoints}
            />
          ))}
        </div>
      </section>

      {/* How to Earn */}
      <Card>
        <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Earning Guidelines</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">1</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Dine-in or Online Order - Earn 1 pt per ₹10 spent automatically</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">2</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Tier Promotions - Higher tiers unlock exclusive multiplier events</p>
          </div>
        </div>
      </Card>

      {/* History */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Points History</h2>
        {history.length === 0 ? (
          <EmptyState title="No points earned yet" description="Place your first order to start accumulating points!" />
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((entry, idx) => (
              <Card key={idx}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{entry.description}</p>
                    <p className="text-xs text-neutral-500">{entry.date}</p>
                  </div>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    +{entry.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
