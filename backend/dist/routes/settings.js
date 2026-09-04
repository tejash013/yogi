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
    let restaurant = await Restaurant.findById(tenantFilter(req).restaurantId).lean().exec();
    if (!restaurant) {
        // Return default restaurant configuration for graceful operation
        return res.json(success({
            name: 'RestaurantOS',
            email: 'contact@restaurantos.com',
            phone: '+91 80 4112 9090',
            address: '12, MG Road, Indiranagar, Bengaluru, Karnataka 560038',
            gstNumber: '29ABCDE1234F1Z5',
            tagline: 'Authentic Dining Experience',
            currency: 'INR',
            taxRate: 5,
            deliveryFee: 40,
            businessHours: {},
        }, 'Restaurant settings loaded'));
    }
    const defaults = {
        name: 'RestaurantOS',
        email: 'contact@restaurantos.com',
        phone: '+91 80 4112 9090',
        address: '12, MG Road, Indiranagar, Bengaluru, Karnataka 560038',
        gstNumber: '29ABCDE1234F1Z5',
        tagline: 'Authentic Dining Experience',
        currency: 'INR',
        taxRate: 5,
        deliveryFee: 40,
        businessHours: {},
    };
    const merged = {
        ...defaults,
        ...restaurant,
    };
    return res.json(success(merged, 'Restaurant settings loaded'));
});
router.patch('/', requirePermission(permissions.settingsManage), validateBody(settingsSchema), async (req, res) => {
    const restaurant = await Restaurant.findByIdAndUpdate(tenantFilter(req).restaurantId, { $set: req.body }, { new: true, runValidators: true }).lean().exec();
    if (!restaurant)
        return res.status(404).json(failure('Restaurant not found'));
    return res.json(success(restaurant, 'Restaurant settings updated'));
});
export default router;
