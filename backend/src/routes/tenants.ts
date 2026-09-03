import { Router } from 'express';
import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import Branch from '../models/Branch.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import { failure, success } from '../utils/response.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validation/schemas.js';
import { tenantFilter } from '../utils/tenant.js';
import { geocodeAddress } from '../utils/geocoding.js';

const router = Router();

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

<<<<<<< HEAD
const router = Router();
=======
// Helper to ensure an item has latitude/longitude if resolvable from address
function withResolvedCoords<T extends { address?: string; name?: string; latitude?: number; longitude?: number }>(
  item: T
): T {
  if (item.latitude !== undefined && item.longitude !== undefined) {
    return item;
  }
  const resolved = geocodeAddress(item.address, item.name);
  if (resolved) {
    return {
      ...item,
      latitude: item.latitude ?? resolved.latitude,
      longitude: item.longitude ?? resolved.longitude,
    };
  }
  return item;
}
>>>>>>> e44c7870034ced4261f22539f3169716529ad4d3

// GET /api/tenants/current - Get current tenant (restaurant & branch) details
router.get('/current', optionalAuth, async (req: any, res) => {
  try {
    const { restaurantId, branchId } = tenantFilter(req);
    const [restaurant, branch] = await Promise.all([
      Restaurant.findOne({ _id: restaurantId, isActive: true }).lean().exec(),
      Branch.findOne({ _id: branchId, isActive: true }).lean().exec(),
    ]);

    const resolvedRest = restaurant ? withResolvedCoords(restaurant) : { _id: restaurantId, name: 'Yogi Restaurant', slug: 'yogi' };
    const resolvedBranch = branch ? withResolvedCoords(branch) : { _id: branchId, name: 'Main Branch', slug: 'main' };

    return res.json(
      success(
        {
          restaurantId,
          branchId,
          restaurant: resolvedRest,
          branch: resolvedBranch,
        },
        'Tenant context loaded'
      )
    );
  } catch {
    return res.status(400).json(failure('Could not load tenant context'));
  }
});

// GET /api/tenants/restaurants - Public list of active restaurants
router.get('/restaurants', optionalAuth, async (_req, res) => {
  const [restaurants, branches] = await Promise.all([
    Restaurant.find({ isActive: true }).sort({ name: 1 }).lean().exec(),
    Branch.find({ isActive: true }).lean().exec(),
  ]);

  const branchCoordsMap = new Map<string, { latitude: number; longitude: number }>();
  for (const b of branches) {
    const coords = withResolvedCoords(b);
    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      const restKey = b.restaurantId ? b.restaurantId.toString() : '';
      if (restKey && !branchCoordsMap.has(restKey)) {
        branchCoordsMap.set(restKey, { latitude: coords.latitude, longitude: coords.longitude });
      }
    }
  }

  const enriched = restaurants.map((r) => {
    let resolved = withResolvedCoords(r);
    if (resolved.latitude === undefined || resolved.longitude === undefined) {
      const branchCoords = branchCoordsMap.get(r._id.toString());
      if (branchCoords) {
        resolved = { ...resolved, latitude: branchCoords.latitude, longitude: branchCoords.longitude };
      }
    }
    return resolved;
  });

  return res.json(success(enriched, 'Restaurants loaded'));
});

// GET /api/tenants/branches - Public list of all active branches across restaurants
router.get('/branches', optionalAuth, async (req, res) => {
  const query: any = { isActive: true };
  if (req.query.restaurantId) {
    query.restaurantId = req.query.restaurantId;
  }
  const branches = await Branch.find(query).sort({ name: 1 }).lean().exec();
  const enriched = branches.map(withResolvedCoords);
  return res.json(success(enriched, 'Branches loaded'));
});

// GET /api/tenants/restaurants/:id/branches - Public list of active branches for a restaurant
router.get('/restaurants/:id/branches', optionalAuth, validateParams(idParamSchema), async (req, res) => {
  const branches = await Branch.find({ restaurantId: req.params.id, isActive: true }).sort({ name: 1 }).lean().exec();
  const enriched = branches.map(withResolvedCoords);
  return res.json(success(enriched, 'Branches loaded'));
});

// POST /api/tenants/restaurants - Provision new restaurant (Platform Admin only)
router.post('/restaurants', authenticate, requireRole('platformAdmin'), validateBody(restaurantSchema), async (req, res) => {
  const payload = { ...req.body };
  if (payload.latitude === undefined || payload.longitude === undefined) {
    const coords = geocodeAddress(payload.address, payload.name);
    if (coords) {
      payload.latitude = coords.latitude;
      payload.longitude = coords.longitude;
    }
  }
  const restaurant = await Restaurant.create(payload);
  return res.status(201).json(success(restaurant, 'Restaurant created successfully'));
});

// POST /api/tenants/restaurants/:id/branches - Provision new branch (Platform Admin or Owner)
router.post('/restaurants/:id/branches', authenticate, requireRole(['platformAdmin', 'owner']), validateParams(idParamSchema), validateBody(branchSchema), async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true }).exec();
  if (!restaurant) return res.status(404).json(failure('Restaurant not found'));

  const payload = { ...req.body, restaurantId: restaurant._id };
  if (payload.latitude === undefined || payload.longitude === undefined) {
    const coords = geocodeAddress(payload.address, payload.name);
    if (coords) {
      payload.latitude = coords.latitude;
      payload.longitude = coords.longitude;
    }
  }

  const branch = await Branch.create(payload);
  return res.status(201).json(success(branch, 'Branch created successfully'));
});

export default router;
