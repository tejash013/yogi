import { Router } from 'express';
import Category from '../models/Category.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { categoryCreateSchema, categoryQuerySchema, categoryUpdateSchema, idParamSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';
const router = Router();
function paginate(items, page, limit) {
    const start = (page - 1) * limit;
    return paginated(items.slice(start, start + limit), items.length, page, limit);
}
router.get('/', validateQuery(categoryQuerySchema), async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const q = String(req.query.q ?? '').trim();
    const filter = { ...tenantFilter(req), isActive: true };
    if (q) {
        filter.name = { $regex: q, $options: 'i' };
    }
    const categories = await Category.find(filter).sort({ name: 1 }).exec();
    return res.json(paginate(categories, page, limit));
});
router.get('/:id', validateParams(idParamSchema), async (req, res) => {
    const category = await Category.findOne({ _id: req.params.id, ...tenantFilter(req) }).exec();
    if (!category) {
        return res.status(404).json(failure('Category not found'));
    }
    return res.json(success(category, 'Category loaded'));
});
router.post('/', authenticate, requirePermission(permissions.menuCreate), validateBody(categoryCreateSchema), async (req, res) => {
    const { name, description, icon, parentId } = req.body;
    if (!name) {
        return res.status(400).json(failure('Category name is required'));
    }
    const tenant = tenantFilter(req);
    if (parentId && !(await Category.exists({ _id: parentId, ...tenant })))
        return res.status(400).json(failure('Parent category belongs to another branch'));
    const category = new Category({ name, description, icon, parentId, ...tenant });
    await category.save();
    return res.status(201).json(success(category, 'Category created successfully'));
});
router.patch('/:id', authenticate, requirePermission(permissions.menuUpdate), validateParams(idParamSchema), validateBody(categoryUpdateSchema), async (req, res) => {
    const category = await Category.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true }).exec();
    if (!category) {
        return res.status(404).json(failure('Category not found'));
    }
    return res.json(success(category, 'Category updated successfully'));
});
router.delete('/:id', authenticate, requirePermission(permissions.menuDelete), validateParams(idParamSchema), async (req, res) => {
    const category = await Category.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { isActive: false }, { new: true }).exec();
    if (!category) {
        return res.status(404).json(failure('Category not found'));
    }
    return res.json(success(category, 'Category deactivated successfully'));
});
export default router;
