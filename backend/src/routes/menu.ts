import { Router } from 'express';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, menuCreateSchema, menuQuerySchema, menuUpdateSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';
import { uploadImage } from '../utils/cloudinaryUpload.js';

const router = Router();

async function resolveMenuImage(image: unknown, tenant: { restaurantId: string; branchId: string }) {
  if (typeof image !== 'string') return { value: image };

  const trimmed = image.trim();
  if (!trimmed) {
    return { value: '', metadata: undefined };
  }

  // Already a Cloudinary URL
  if (/cloudinary\.com/i.test(trimmed)) {
    return {
      value: trimmed,
      metadata: { provider: 'cloudinary' },
    };
  }

  const isDataUrl = trimmed.startsWith('data:image/');
  const isRemoteUrl = /^https?:\/\//i.test(trimmed);

  if (!isDataUrl && !isRemoteUrl) {
    return { value: trimmed, metadata: { provider: 'local' } };
  }

  const hasCloudinaryConfig = Boolean(
    process.env.CLOUDINARY_URL || (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  );

  if (hasCloudinaryConfig) {
    try {
      const result = await uploadImage(
        trimmed,
        undefined,
        `restaurants/${tenant.restaurantId}/branches/${tenant.branchId}/menu-items`
      );
      if (result && result.secure_url) {
        return {
          value: result.secure_url,
          metadata: {
            provider: 'cloudinary',
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          },
        };
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, falling back to direct image format:', cloudErr);
    }
  }

  return {
    value: trimmed,
    metadata: { provider: isDataUrl ? 'local' : 'external' },
  };
}

router.get('/', validateQuery(menuQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const q = String(req.query.q ?? '').trim();
  const categoryId = String(req.query.category ?? '').trim();

  const filter: any = { ...tenantFilter(req), isActive: true };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (categoryId) {
    filter.category = categoryId;
  }

  const total = await MenuItem.countDocuments(filter).exec();
  const items = await MenuItem.find(filter)
    .populate('category', 'name')
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginated(items, total, page, limit));
});

router.get('/popular', async (req, res) => {
  const items = await MenuItem.find({ ...tenantFilter(req), isPopular: true, isActive: true }).populate('category', 'name').exec();
  return res.json(success(items, 'Popular menu items loaded'));
});

router.get('/recommended', async (req, res) => {
  const items = await MenuItem.find({ ...tenantFilter(req), isRecommended: true, isActive: true }).populate('category', 'name').exec();
  return res.json(success(items, 'Recommended items loaded'));
});

router.get('/search', validateQuery(menuQuerySchema.pick({ q: true })), async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const items = await MenuItem.find({
    ...tenantFilter(req),
    isActive: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  })
    .populate('category', 'name')
    .exec();

  return res.json(paginated(items, items.length, 1, items.length));
});

router.get('/:id', validateParams(idParamSchema), async (req, res) => {
  const item = await MenuItem.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate('category', 'name').exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item loaded'));
});

router.post('/', authenticate, requirePermission(permissions.menuCreate), validateBody(menuCreateSchema), async (req, res) => {
  try {
    const { title, description, category, price, image, isPopular, isRecommended, tags } = req.body;

    const tenant = tenantFilter(req);
    const resolvedImage = await resolveMenuImage(image, tenant);
    const categoryExists = await Category.findOne({ _id: category, ...tenant }).exec();
    if (!categoryExists) {
      return res.status(404).json(failure('Category not found'));
    }

    const menuItem = new MenuItem({
      ...tenant,
      title,
      description,
      category,
      price,
      image: resolvedImage.value,
      imageMetadata: resolvedImage.metadata,
      isPopular: Boolean(isPopular),
      isRecommended: Boolean(isRecommended),
      tags: Array.isArray(tags) ? tags : [],
    });
    await menuItem.save();

    return res.status(201).json(success(menuItem, 'Menu item created successfully'));
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return res.status(500).json(failure(error?.message || 'Failed to create menu item'));
  }
});

router.patch('/:id', authenticate, requirePermission(permissions.menuUpdate), validateParams(idParamSchema), validateBody(menuUpdateSchema), async (req, res) => {
  try {
    const tenant = tenantFilter(req);
    if (req.body.category && !(await Category.exists({ _id: req.body.category, ...tenant }))) {
      return res.status(400).json(failure('Category belongs to another branch'));
    }

    const update = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(update, 'image')) {
      const resolvedImage = await resolveMenuImage(update.image, tenant);
      update.image = resolvedImage.value;
      update.imageMetadata = resolvedImage.metadata;
    }

    // Try finding and updating with active branch first
    let item = await MenuItem.findOneAndUpdate({ _id: req.params.id, ...tenant }, update, { new: true }).populate('category', 'name').exec();

    // Fallback: If not found under active branch and user is owner or platformAdmin, search by restaurant
    if (!item && ((req as any).user?.role === 'owner' || (req as any).user?.role === 'platformAdmin')) {
      item = await MenuItem.findOneAndUpdate({ _id: req.params.id, restaurantId: tenant.restaurantId }, update, { new: true }).populate('category', 'name').exec();
    }

    if (!item) {
      return res.status(404).json(failure('Menu item not found'));
    }

    return res.json(success(item, 'Menu item updated successfully'));
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return res.status(500).json(failure(error?.message || 'Failed to update menu item'));
  }
});

router.delete('/:id', authenticate, requirePermission(permissions.menuDelete), validateParams(idParamSchema), async (req, res) => {
  try {
    const tenant = tenantFilter(req);
    let item = await MenuItem.findOneAndUpdate({ _id: req.params.id, ...tenant }, { isActive: false }, { new: true }).exec();

    if (!item && ((req as any).user?.role === 'owner' || (req as any).user?.role === 'platformAdmin')) {
      item = await MenuItem.findOneAndUpdate({ _id: req.params.id, restaurantId: tenant.restaurantId }, { isActive: false }, { new: true }).exec();
    }

    if (!item) {
      return res.status(404).json(failure('Menu item not found'));
    }

    return res.json(success(item, 'Menu item deactivated successfully'));
  } catch (error: any) {
    console.error('Error deactivating menu item:', error);
    return res.status(500).json(failure(error?.message || 'Failed to deactivate menu item'));
  }
});

export default router;
