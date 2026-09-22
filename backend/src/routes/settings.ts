import { Router } from 'express';
import Restaurant from '../models/Restaurant.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { tenantFilter } from '../utils/tenant.js';
import { success, failure } from '../utils/response.js';
import { permissions } from '../auth/permissions.js';
import { z } from 'zod';

const router = Router();
const settingsSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().min(7).optional(),
  address: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  tagline: z.string().trim().optional(),
  currency: z.string().trim().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  deliveryFee: z.number().min(0).optional(),
  businessHours: z.record(z.string(), z.object({
    status: z.enum(['open', 'closed']),
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional(),
}).strict();

router.use(authenticate);

router.get('/', requirePermission(permissions.settingsRead), async (req, res) => {
  const tenant = tenantFilter(req);
  const restaurant = await Restaurant.findById(tenant.restaurantId).lean().exec();
  
  const defaults = {
    name: 'Yogi Restaurant',
    email: 'contact@yogirestaurant.com',
    phone: '+91 98251 23456',
    address: 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India',
    gstNumber: '',
    tagline: 'Authentic Dining & Smart Kitchen',
    currency: 'INR',
    taxRate: 0,
    deliveryFee: 40,
    businessHours: {},
  };

  const merged = {
    ...defaults,
    ...(restaurant || {}),
  };

  return res.json(success(merged, 'Restaurant settings loaded'));
});

router.patch('/', requirePermission(permissions.settingsManage), validateBody(settingsSchema), async (req, res) => {
  const tenant = tenantFilter(req);
  const slug = req.body.name
    ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : 'yogi-restaurant';

  const updateData: Record<string, any> = { ...req.body };
  if (req.body.name) {
    updateData.slug = slug;
  }

  const restaurant = await Restaurant.findByIdAndUpdate(
    tenant.restaurantId,
    {
      $set: updateData,
      $setOnInsert: { slug: slug || 'yogi-restaurant' },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean().exec();

  return res.json(success(restaurant, 'Restaurant settings updated'));
});

export default router;