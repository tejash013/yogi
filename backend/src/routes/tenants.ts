import { Router } from 'express';
import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import Branch from '../models/Branch.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import { failure, success } from '../utils/response.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validation/schemas.js';
import { tenantFilter } from '../utils/tenant.js';

const restaurantSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  address: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).strict();

const branchSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  address: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).strict();

// GET /api/tenants/current - Get current tenant (restaurant & branch) details
router.get('/current', optionalAuth, async (req: any, res) => {
  try {
    const { restaurantId, branchId } = tenantFilter(req);
    const [restaurant, branch] = await Promise.all([
      Restaurant.findOne({ _id: restaurantId, isActive: true }).exec(),
      Branch.findOne({ _id: branchId, isActive: true }).exec(),
    ]);

    return res.json(
      success(
        {
          restaurantId,
          branchId,
          restaurant: restaurant ?? { _id: restaurantId, name: 'Yogi Restaurant', slug: 'yogi' },
          branch: branch ?? { _id: branchId, name: 'Main Branch', slug: 'main' },
        },
        'Tenant context loaded'
      )
    );
  } catch (err) {
    return res.status(400).json(failure('Could not load tenant context'));
  }
});

// GET /api/tenants/restaurants - Public list of active restaurants
router.get('/restaurants', optionalAuth, async (_req, res) => {
  const restaurants = await Restaurant.find({ isActive: true }).sort({ name: 1 }).exec();
  return res.json(success(restaurants, 'Restaurants loaded'));
});

// GET /api/tenants/restaurants/:id/branches - Public list of active branches for a restaurant
router.get('/restaurants/:id/branches', optionalAuth, validateParams(idParamSchema), async (req, res) => {
  const branches = await Branch.find({ restaurantId: req.params.id, isActive: true }).sort({ name: 1 }).exec();
  return res.json(success(branches, 'Branches loaded'));
});

// POST /api/tenants/restaurants - Provision new restaurant (Platform Admin only)
router.post('/restaurants', authenticate, requireRole('platformAdmin'), validateBody(restaurantSchema), async (req, res) => {
  const restaurant = await Restaurant.create(req.body);
  return res.status(201).json(success(restaurant, 'Restaurant created successfully'));
});

// POST /api/tenants/restaurants/:id/branches - Provision new branch (Platform Admin or Owner)
router.post('/restaurants/:id/branches', authenticate, requireRole(['platformAdmin', 'owner']), validateParams(idParamSchema), validateBody(branchSchema), async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true }).exec();
  if (!restaurant) return res.status(404).json(failure('Restaurant not found'));
  const branch = await Branch.create({ ...req.body, restaurantId: restaurant._id });
  return res.status(201).json(success(branch, 'Branch created successfully'));
});

export default router;
