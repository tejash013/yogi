import { Router } from 'express';
import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import RestaurantSubscription from '../models/RestaurantSubscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { failure, success } from '../utils/response.js';

const router = Router();
const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const statusSchema = z.enum(['trial', 'active', 'past_due', 'cancelled', 'expired', 'suspended']);
const planBodySchema = z.object({
  name: z.string().trim().min(1),
  key: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().optional(),
  amount: z.number().min(0),
  currency: z.string().trim().min(3).max(3).default('INR'),
  billingCycle: z.enum(['monthly', 'yearly']),
  isActive: z.boolean().optional(),
}).strict();
const subscriptionUpdateSchema = z.object({
  status: statusSchema.optional(),
  planId: idSchema.optional(),
  currentPeriodEnd: z.coerce.date().optional(),
}).strict();

const publicPlan = (plan: any) => ({
  id: String(plan._id),
  name: plan.name,
  key: plan.key,
  description: plan.description,
  amount: plan.amount,
  currency: plan.currency,
  billingCycle: plan.billingCycle,
  isActive: plan.isActive,
});

const serializeSubscription = (subscription: any) => ({
  id: String(subscription._id),
  restaurantId: String(subscription.restaurantId?._id ?? subscription.restaurantId),
  restaurantName: subscription.restaurantId?.name,
  ownerId: String(subscription.ownerId?._id ?? subscription.ownerId),
  ownerName: subscription.ownerId?.firstName
    ? `${subscription.ownerId.firstName} ${subscription.ownerId.lastName ?? ''}`.trim()
    : undefined,
  plan: subscription.planId ? publicPlan(subscription.planId) : undefined,
  status: subscription.status,
  billingCycle: subscription.billingCycle,
  amount: subscription.amount,
  currency: subscription.currency,
  trialEndsAt: subscription.trialEndsAt,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  cancelledAt: subscription.cancelledAt,
});

async function ensureSubscription(restaurantId: string, ownerId: string) {
  const existing = await RestaurantSubscription.findOne({ restaurantId }).populate('planId').exec();
  if (existing) return existing;

  const plan = await ensureStarterPlan();

  const start = new Date();
  const trialEnds = new Date(start);
  trialEnds.setDate(trialEnds.getDate() + 14);
  const subscription = await RestaurantSubscription.create({
    restaurantId,
    ownerId,
    planId: plan._id,
    status: 'trial',
    billingCycle: plan.billingCycle,
    amount: plan.amount,
    currency: plan.currency,
    trialEndsAt: trialEnds,
    currentPeriodStart: start,
    currentPeriodEnd: trialEnds,
  });
  return RestaurantSubscription.findById(subscription._id).populate('planId').exec();
}

async function ensureStarterPlan() {
  return SubscriptionPlan.findOneAndUpdate(
    { key: 'starter' },
    {
      $setOnInsert: {
        name: 'Starter',
        key: 'starter',
        description: 'Full RestaurantOS access with flexible billing.',
        amount: 0,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
      },
    },
    { new: true, upsert: true },
  ).exec();
}

router.get('/plans', authenticate, async (_req, res) => {
  await ensureStarterPlan();
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ amount: 1, name: 1 }).lean().exec();
  return res.json(success(plans.map(publicPlan), 'Subscription plans loaded'));
});

router.get('/current', authenticate, async (req: any, res) => {
  if (!['owner', 'platformAdmin'].includes(req.user.role)) return res.status(403).json(failure('Forbidden'));
  const restaurantId = req.user.restaurantId;
  const subscription = await ensureSubscription(restaurantId, req.user.id);
  return res.json(success(subscription ? serializeSubscription(subscription) : null, 'Subscription loaded'));
});

router.get('/restaurants', authenticate, requireRole('platformAdmin'), async (_req, res) => {
  const restaurants = await Restaurant.find({}).sort({ name: 1 }).lean().exec();
  const subscriptions = await RestaurantSubscription.find({})
    .populate('restaurantId', 'name')
    .populate('ownerId', 'firstName lastName email')
    .populate('planId')
    .lean()
    .exec();
  const byRestaurant = new Map(subscriptions.map((item) => [String((item.restaurantId as any)?._id ?? item.restaurantId), item]));
  const result = await Promise.all(restaurants.map(async (restaurant) => {
    const existing = byRestaurant.get(String(restaurant._id));
    const subscription = existing ?? await ensureSubscription(String(restaurant._id), String((await User.findOne({ restaurantId: restaurant._id, role: 'owner' }).lean().exec())?._id ?? reqUserFallback()));
    return serializeSubscription(subscription);
  }));
  return res.json(success(result, 'Restaurant subscriptions loaded'));
});

function reqUserFallback() {
  return '000000000000000000000001';
}

router.patch('/restaurants/:restaurantId', authenticate, requireRole('platformAdmin'), async (req: any, res) => {
  const parsedId = idSchema.safeParse(req.params.restaurantId);
  const parsedBody = subscriptionUpdateSchema.safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) return res.status(400).json(failure('Invalid subscription update'));
  const restaurant = await Restaurant.findById(parsedId.data).lean().exec();
  if (!restaurant) return res.status(404).json(failure('Restaurant not found'));
  const owner = await User.findOne({ restaurantId: restaurant._id, role: 'owner' }).lean().exec();
  if (!owner) return res.status(400).json(failure('Restaurant owner not found'));
  const subscription = await ensureSubscription(String(restaurant._id), String(owner._id));
  const update: any = { ...parsedBody.data };
  if (parsedBody.data.planId) {
    const plan = await SubscriptionPlan.findOne({ _id: parsedBody.data.planId, isActive: true }).lean().exec();
    if (!plan) return res.status(400).json(failure('Active subscription plan not found'));
    update.billingCycle = plan.billingCycle;
    update.amount = plan.amount;
    update.currency = plan.currency;
  }
  const updated = await RestaurantSubscription.findByIdAndUpdate(subscription?._id, update, { new: true })
    .populate('restaurantId', 'name')
    .populate('ownerId', 'firstName lastName email')
    .populate('planId')
    .lean()
    .exec();
  return res.json(success(updated ? serializeSubscription(updated) : null, 'Subscription updated'));
});

router.post('/plans', authenticate, requireRole('platformAdmin'), async (req, res) => {
  const parsed = planBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(failure('Invalid subscription plan'));
  const plan = await SubscriptionPlan.create(parsed.data);
  return res.status(201).json(success(publicPlan(plan), 'Subscription plan created'));
});

export default router;