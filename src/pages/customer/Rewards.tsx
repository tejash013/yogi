import { Card } from '@/components/ui';
import { RewardCard } from '@/components/customer';

const currentPoints = 1250;
const nextTier = 2500;
const tierProgress = (currentPoints / nextTier) * 100;

const rewards = [
  { points: 500, reward: '$5 Off', label: 'Any order above $20' },
  { points: 1000, reward: 'Free Dessert', label: 'Any dessert on the menu' },
  { points: 2500, reward: '$25 Off', label: 'Any order above $50' },
  { points: 5000, reward: 'Free Meal', label: 'Any main course up to $25' },
  { points: 10000, reward: '$75 Off', label: 'Any order above $100' },
];

const history = [
  { date: '2025-03-15', description: 'Order #ORD-001', points: 25 },
  { date: '2025-03-14', description: 'Order #ORD-002', points: 35 },
  { date: '2025-03-12', description: 'Order #ORD-003', points: 20 },
  { date: '2025-03-10', description: 'Order #ORD-004', points: 15 },
  { date: '2025-03-08', description: 'Reward Redeemed - $5 Off', points: -500 },
];

export default function Rewards() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Rewards & Loyalty</h1>

      {/* Points Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white">
        <div className="relative">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-sm text-white/70">Your Points Balance</p>
            <p className="mt-1 text-5xl font-bold">{currentPoints.toLocaleString()}</p>
            <p className="mt-1 text-sm text-white/70">Earn 1 point for every $1 spent</p>

            {/* Tier Progress */}
            <div className="mt-6">
              <div className="mb-1 flex items-center justify-between text-xs text-white/70">
                <span>Silver</span>
                <span>Gold</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-white/70">
                {(nextTier - currentPoints).toLocaleString()} points to reach Gold tier
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Available Rewards */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
          Available Rewards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">How to Earn Points</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">1</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Place an order - Earn 1 point per $1 spent</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">2</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Write a review - Earn 50 bonus points</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">3</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Refer a friend - Earn 100 bonus points</p>
          </div>
        </div>
      </Card>

      {/* History */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Points History</h2>
        <div className="space-y-3">
          {history.map((entry, idx) => (
            <Card key={idx}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{entry.description}</p>
                  <p className="text-xs text-neutral-500">{entry.date}</p>
                </div>
                <span className={`font-bold text-sm ${
                  entry.points > 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {entry.points > 0 ? '+' : ''}{entry.points} pts
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

