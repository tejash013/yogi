import { Router } from 'express';
import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import { failure, success } from '../utils/response.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validation/schemas.js';
import { tenantFilter } from '../utils/tenant.js';
import { geocodeAddress } from '../utils/geocoding.js';
const router = Router();
// Structured Address Schema
const addressDetailsSchema = z.object({
    street: z.string().trim().optional(),
    landmark: z.string().trim().optional(),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    pincode: z.string().trim().optional(),
    country: z.string().trim().default('India').optional(),
});
// Restaurant Validation Schemas
const restaurantSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    tagline: z.string().trim().optional(),
    description: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().trim().optional(),
    address: z.string().trim().optional(),
    addressDetails: addressDetailsSchema.optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    gstNumber: z.string().trim().optional(),
    currency: z.string().trim().default('INR').optional(),
    taxRate: z.number().min(0).max(100).optional(),
    deliveryFee: z.number().min(0).optional(),
    businessHours: z.record(z.string(), z.any()).optional(),
    isActive: z.boolean().optional(),
}).strict();
const restaurantUpdateSchema = restaurantSchema.partial().strict();
// Branch Validation Schemas
const branchSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    branchCode: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().email().optional().or(z.literal('')),
    managerName: z.string().trim().optional(),
    address: z.string().trim().optional(),
    addressDetails: addressDetailsSchema.optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    businessHours: z.record(z.string(), z.any()).optional(),
    seatingCapacity: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
}).strict();
const branchUpdateSchema = branchSchema.partial().strict();
function managerNamePattern(name) {
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}$`, 'i');
}
// Helper to construct consolidated full address from addressDetails
export function formatFullAddress(details, fallback) {
    if (!details || (!details.city && !details.street)) {
        return fallback || '';
    }
    const parts = [
        details.street,
        details.landmark ? `Near ${details.landmark}` : undefined,
        details.city,
        details.state && details.pincode ? `${details.state} - ${details.pincode}` : details.state || details.pincode,
        details.country || 'India',
    ].filter(Boolean);
    return parts.join(', ');
}
// Helper to ensure an item has latitude/longitude if resolvable from address or city
function withResolvedCoords(item) {
    if (item.latitude !== undefined && item.longitude !== undefined && Number.isFinite(item.latitude) && Number.isFinite(item.longitude)) {
        return item;
    }
    const combinedAddress = [
        item.addressDetails?.street,
        item.addressDetails?.city,
        item.addressDetails?.state,
        item.address,
        item.name,
    ].filter(Boolean).join(' ');
    const resolved = geocodeAddress(combinedAddress, item.name);
    if (resolved) {
        return {
            ...item,
            latitude: item.latitude ?? resolved.latitude,
            longitude: item.longitude ?? resolved.longitude,
        };
    }
    return item;
}
// GET /api/tenants/current - Get current tenant (restaurant & branch) details
router.get('/current', optionalAuth, async (req, res) => {
    try {
        const { restaurantId, branchId } = tenantFilter(req);
        const [restaurant, branch] = await Promise.all([
            Restaurant.findOne({ _id: restaurantId, isActive: true }).lean().exec(),
            Branch.findOne({ _id: branchId, isActive: true }).lean().exec(),
        ]);
        const resolvedRest = restaurant ? withResolvedCoords(restaurant) : { _id: restaurantId, name: 'Yogi Restaurant', slug: 'yogi' };
        const resolvedBranch = branch ? withResolvedCoords(branch) : { _id: branchId, name: 'Main Branch', slug: 'main' };
        return res.json(success({
            restaurantId,
            branchId,
            restaurant: resolvedRest,
            branch: resolvedBranch,
        }, 'Tenant context loaded'));
    }
    catch {
        return res.status(400).json(failure('Could not load tenant context'));
    }
});
// GET /api/tenants/restaurants - Public or Authenticated list of restaurants
router.get('/restaurants', optionalAuth, async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true' && req.user && ['platformAdmin', 'owner'].includes(req.user.role);
    const filter = includeInactive ? {} : { isActive: true };
    const [restaurants, branches] = await Promise.all([
        Restaurant.find(filter).sort({ name: 1 }).lean().exec(),
        Branch.find(filter).lean().exec(),
    ]);
    const branchCoordsMap = new Map();
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
// GET /api/tenants/restaurants/:id - Get single restaurant by ID
router.get('/restaurants/:id', optionalAuth, validateParams(idParamSchema), async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id).lean().exec();
    if (!restaurant)
        return res.status(404).json(failure('Restaurant not found'));
    const enriched = withResolvedCoords(restaurant);
    const branchCount = await Branch.countDocuments({ restaurantId: restaurant._id, isActive: true }).exec();
    return res.json(success({ ...enriched, branchCount }, 'Restaurant loaded'));
});
// POST /api/tenants/restaurants - Provision new restaurant (Platform Admin or Owner)
router.post('/restaurants', authenticate, requireRole(['platformAdmin', 'owner']), validateBody(restaurantSchema), async (req, res) => {
    const payload = { ...req.body };
    // Generate consolidated address if addressDetails are provided
    if (payload.addressDetails) {
        payload.address = formatFullAddress(payload.addressDetails, payload.address);
    }
    // Resolve coordinates if missing
    if (payload.latitude === undefined || payload.longitude === undefined) {
        const combinedAddress = [
            payload.addressDetails?.street,
            payload.addressDetails?.city,
            payload.addressDetails?.state,
            payload.address,
            payload.name,
        ].filter(Boolean).join(' ');
        const coords = geocodeAddress(combinedAddress, payload.name);
        if (coords) {
            payload.latitude = coords.latitude;
            payload.longitude = coords.longitude;
        }
    }
    const restaurant = await Restaurant.create(payload);
    // If created by an owner whose restaurantId is not yet assigned, link it
    if (req.user?.role === 'owner' && !req.user.restaurantId) {
        await User.findByIdAndUpdate(req.user.id, { $set: { restaurantId: restaurant._id } });
    }
    return res.status(201).json(success(restaurant, 'Restaurant created successfully'));
});
// PUT /api/tenants/restaurants/:id - Update restaurant (Platform Admin or Owner of this restaurant)
router.put('/restaurants/:id', authenticate, requireRole(['platformAdmin', 'owner']), validateParams(idParamSchema), validateBody(restaurantUpdateSchema), async (req, res) => {
    if (req.user.role === 'owner' && String(req.user.restaurantId) !== req.params.id) {
        return res.status(403).json(failure('Owners can only update their own restaurant profile'));
    }
    const payload = { ...req.body };
    if (payload.addressDetails) {
        payload.address = formatFullAddress(payload.addressDetails, payload.address);
    }
    if (payload.latitude === undefined || payload.longitude === undefined) {
        const combinedAddress = [
            payload.addressDetails?.street,
            payload.addressDetails?.city,
            payload.addressDetails?.state,
            payload.address,
            payload.name,
        ].filter(Boolean).join(' ');
        const coords = geocodeAddress(combinedAddress, payload.name);
        if (coords) {
            payload.latitude = coords.latitude;
            payload.longitude = coords.longitude;
        }
    }
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true }).lean().exec();
    if (!updated)
        return res.status(404).json(failure('Restaurant not found'));
    return res.json(success(withResolvedCoords(updated), 'Restaurant updated successfully'));
});
// DELETE /api/tenants/restaurants/:id - Deactivate or Delete restaurant (Platform Admin or Owner)
router.delete('/restaurants/:id', authenticate, requireRole(['platformAdmin', 'owner']), validateParams(idParamSchema), async (req, res) => {
    if (req.user.role === 'owner' && String(req.user.restaurantId) !== req.params.id) {
        return res.status(403).json(failure('Owners can only deactivate their own restaurant'));
    }
    const permanent = req.query.permanent === 'true' && req.user.role === 'platformAdmin';
    if (permanent) {
        const deleted = await Restaurant.findByIdAndDelete(req.params.id).exec();
        if (!deleted)
            return res.status(404).json(failure('Restaurant not found'));
        await Branch.deleteMany({ restaurantId: req.params.id }).exec();
        return res.json(success(null, 'Restaurant and its branches permanently deleted'));
    }
    const deactivated = await Restaurant.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).exec();
    if (!deactivated)
        return res.status(404).json(failure('Restaurant not found'));
    // Also deactivate child branches
    await Branch.updateMany({ restaurantId: req.params.id }, { $set: { isActive: false } }).exec();
    return res.json(success(deactivated, 'Restaurant deactivated successfully'));
});
// GET /api/tenants/branches - Public or filtered list of branches across restaurants
router.get('/branches', optionalAuth, async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true' && req.user && ['platformAdmin', 'owner'].includes(req.user.role);
    const query = includeInactive ? {} : { isActive: true };
    if (req.query.restaurantId) {
        query.restaurantId = req.query.restaurantId;
    }
    const branches = await Branch.find(query).sort({ name: 1 }).lean().exec();
    const enriched = branches.map(withResolvedCoords);
    return res.json(success(enriched, 'Branches loaded'));
});
// GET /api/tenants/branches/:id - Get single branch by ID
router.get('/branches/:id', optionalAuth, validateParams(idParamSchema), async (req, res) => {
    const branch = await Branch.findById(req.params.id).lean().exec();
    if (!branch)
        return res.status(404).json(failure('Branch not found'));
    const enriched = withResolvedCoords(branch);
    return res.json(success(enriched, 'Branch loaded'));
});
// GET /api/tenants/restaurants/:id/branches - List branches for a specific restaurant
router.get('/restaurants/:id/branches', optionalAuth, validateParams(idParamSchema), async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true' && req.user && ['platformAdmin', 'owner'].includes(req.user.role);
    const filter = { restaurantId: req.params.id };
    if (!includeInactive) {
        filter.isActive = true;
    }
    const branches = await Branch.find(filter).sort({ name: 1 }).lean().exec();
    const enriched = branches.map(withResolvedCoords);
    return res.json(success(enriched, 'Branches loaded'));
});
// POST /api/tenants/restaurants/:id/branches - Provision new branch (Platform Admin or Owner)
router.post('/restaurants/:id/branches', authenticate, requireRole(['platformAdmin', 'owner']), validateParams(idParamSchema), validateBody(branchSchema), async (req, res) => {
    const restaurant = await Restaurant.findOne({ _id: req.params.id }).exec();
    if (!restaurant)
        return res.status(404).json(failure('Restaurant not found'));
    if (req.user.role === 'owner' && String(req.user.restaurantId) !== String(restaurant._id)) {
        return res.status(403).json(failure('Owners can only add branches to their assigned restaurant'));
    }
    const payload = { ...req.body, restaurantId: restaurant._id };
    if (payload.addressDetails) {
        payload.address = formatFullAddress(payload.addressDetails, payload.address);
    }
    if (payload.latitude === undefined || payload.longitude === undefined) {
        const combinedAddress = [
            payload.addressDetails?.street,
            payload.addressDetails?.city,
            payload.addressDetails?.state,
            payload.address,
            payload.name,
        ].filter(Boolean).join(' ');
        const coords = geocodeAddress(combinedAddress, payload.name);
        if (coords) {
            payload.latitude = coords.latitude;
            payload.longitude = coords.longitude;
        }
    }
    const branch = await Branch.create(payload);
    return res.status(201).json(success(withResolvedCoords(branch.toObject()), 'Branch created successfully'));
});
// PUT /api/tenants/branches/:id - Update branch details (Platform Admin, Owner, or assigned Manager)
router.put('/branches/:id', authenticate, requireRole(['platformAdmin', 'owner', 'manager']), validateParams(idParamSchema), validateBody(branchUpdateSchema), async (req, res) => {
    const branch = await Branch.findById(req.params.id).exec();
    if (!branch)
        return res.status(404).json(failure('Branch not found'));
    if (req.user.role === 'owner' && String(req.user.restaurantId) !== String(branch.restaurantId)) {
        return res.status(403).json(failure('Owners can only update branches under their assigned restaurant'));
    }
    if (req.user.role === 'manager' && String(req.user.branchId) !== String(branch._id)) {
        return res.status(403).json(failure('Managers can only update their own assigned branch'));
    }
    const payload = { ...req.body };
    if (payload.addressDetails) {
        payload.address = formatFullAddress(payload.addressDetails, payload.address);
    }
    if (payload.latitude === undefined || payload.longitude === undefined) {
        const combinedAddress = [
            payload.addressDetails?.street,
            payload.addressDetails?.city,
            payload.addressDetails?.state,
            payload.address,
            payload.name || branch.name,
        ].filter(Boolean).join(' ');
        const coords = geocodeAddress(combinedAddress, payload.name || branch.name);
        if (coords) {
            payload.latitude = coords.latitude;
            payload.longitude = coords.longitude;
        }
    }
    const updated = await Branch.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true }).lean().exec();
    if (payload.managerName) {
        const manager = await User.findOne({
            restaurantId: branch.restaurantId,
            role: 'manager',
            status: 'active',
            $expr: {
                $regexMatch: {
                    input: { $trim: { input: { $concat: ['$firstName', ' ', { $ifNull: ['$lastName', ''] }] } } },
                    regex: managerNamePattern(payload.managerName),
                },
            },
        }).exec();
        if (manager && String(manager.branchId) !== String(branch._id)) {
            manager.branchId = branch._id;
            manager.tokenVersion = (manager.tokenVersion ?? 0) + 1;
            await manager.save();
        }
    }
    return res.json(success(withResolvedCoords(updated), 'Branch updated successfully'));
});
// DELETE /api/tenants/branches/:id - Deactivate or Delete branch (Platform Admin or Owner)
router.delete('/branches/:id', authenticate, requireRole(['platformAdmin', 'owner']), validateParams(idParamSchema), async (req, res) => {
    const branch = await Branch.findById(req.params.id).exec();
    if (!branch)
        return res.status(404).json(failure('Branch not found'));
    if (req.user.role === 'owner' && String(req.user.restaurantId) !== String(branch.restaurantId)) {
        return res.status(403).json(failure('Owners can only delete branches under their assigned restaurant'));
    }
    const permanent = req.query.permanent === 'true';
    if (permanent) {
        await Branch.findByIdAndDelete(req.params.id).exec();
        return res.json(success(null, 'Branch permanently deleted'));
    }
    const deactivated = await Branch.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).exec();
    return res.json(success(deactivated, 'Branch deactivated successfully'));
});
export default router;
