import { Router } from 'express';
import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import Branch from '../models/Branch.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { failure, success } from '../utils/response.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validation/schemas.js';

const router = Router();
const restaurantSchema = z.object({ name: z.string().trim().min(1), slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/) }).strict();
const branchSchema = z.object({ name: z.string().trim().min(1), slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/), address: z.string().trim().optional() }).strict();

router.use(authenticate, requireRole('platformAdmin'));

router.post('/restaurants', validateBody(restaurantSchema), async (req, res) => {
  const restaurant = await Restaurant.create(req.body);
  return res.status(201).json(success(restaurant, 'Restaurant created successfully'));
});

router.post('/restaurants/:id/branches', validateParams(idParamSchema), validateBody(branchSchema), async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true }).exec();
  if (!restaurant) return res.status(404).json(failure('Restaurant not found'));
  const branch = await Branch.create({ ...req.body, restaurantId: restaurant._id });
  return res.status(201).json(success(branch, 'Branch created successfully'));
});

router.get('/restaurants', async (_req, res) => {
  const restaurants = await Restaurant.find({ isActive: true }).sort({ name: 1 }).exec();
  return res.json(success(restaurants, 'Restaurants loaded'));
});

router.get('/restaurants/:id/branches', validateParams(idParamSchema), async (req, res) => {
  const branches = await Branch.find({ restaurantId: req.params.id, isActive: true }).sort({ name: 1 }).exec();
  return res.json(success(branches, 'Branches loaded'));
});

export default router;
