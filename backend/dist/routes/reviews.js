import { Router } from 'express';
import Review from '../models/Review.js';
import MenuItem from '../models/MenuItem.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { reviewCreateSchema, reviewMenuParamSchema } from '../validation/reviewSchemas.js';
import { failure, success } from '../utils/response.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';
const router = Router();
router.get('/menu/:menuItemId', validateParams(reviewMenuParamSchema), async (req, res) => {
    const reviews = await Review.find({ menuItem: req.params.menuItemId, ...tenantFilter(req) })
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(100)
        .exec();
    return res.json(success(reviews, 'Menu item reviews loaded'));
});
router.post('/', authenticate, requirePermission(permissions.reviewsCreate), validateBody(reviewCreateSchema), async (req, res) => {
    const { menuItemId, rating, subject, comment, images } = req.body;
    const tenant = tenantFilter(req);
    const menuItem = await MenuItem.findOne({ _id: menuItemId, ...tenant }).exec();
    if (!menuItem)
        return res.status(404).json(failure('Menu item not found'));
    const review = await Review.findOneAndUpdate({ menuItem: menuItemId, user: req.user.id, ...tenant }, { menuItem: menuItemId, user: req.user.id, rating, subject, comment, images: images ?? [], ...tenant }, { new: true, upsert: true, setDefaultsOnInsert: true }).populate('user', 'firstName lastName').exec();
    const aggregate = await Review.aggregate([
        { $match: { menuItem: menuItem._id, ...tenant } },
        { $group: { _id: '$menuItem', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]).exec();
    const summary = aggregate[0] ?? { average: 0, count: 0 };
    await MenuItem.updateOne({ _id: menuItem._id, ...tenant }, {
        rating: Number(Number(summary.average).toFixed(2)),
        totalReviews: summary.count,
    }).exec();
    return res.status(201).json(success(review, 'Review submitted successfully'));
});
export default router;
