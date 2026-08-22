import { z } from 'zod';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID');
const positiveInt = z.coerce.number().int().positive();
const nonNegativeNumber = z.coerce.number().nonnegative();

export const idParamSchema = z.object({ id: objectId });

export const paginationQuerySchema = z.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(20),
  q: z.string().trim().optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  parentId: objectId.optional(),
}).strict();
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const employeeCreateSchema = z.object({
  user: objectId.optional(),
  name: z.string().trim().min(1),
  email: z.string().email(),
  phone: z.string().trim().min(7),
  role: z.enum(['cashier', 'chef', 'manager', 'owner']).optional(),
  shift: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  salary: nonNegativeNumber.optional(),
  joiningDate: z.coerce.date().optional(),
}).strict();
export const employeeUpdateSchema = employeeCreateSchema.partial();

export const offerCreateSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: nonNegativeNumber,
  validUntil: z.coerce.date(),
  terms: z.array(z.string().trim()).optional(),
  offerType: z.enum(['offer', 'coupon']).optional(),
  code: z.string().trim().optional(),
}).strict();
export const offerUpdateSchema = offerCreateSchema.partial();
export const couponValidationSchema = z.object({ code: z.string().trim().min(1) }).strict();

export const invoiceCreateSchema = z.object({
  orderId: objectId,
  paymentMethod: z.string().trim().optional(),
}).strict();
export const invoiceUpdateSchema = z.object({ paymentMethod: z.string().trim().optional() }).strict();
export const invoiceStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled']),
  transactionId: z.string().trim().min(1).optional(),
}).strict();

export const tableCreateSchema = z.object({
  label: z.string().trim().min(1),
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']).optional(),
  capacity: z.coerce.number().int().positive(),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).strict();
export const tableUpdateSchema = tableCreateSchema.partial();
export const tableStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']),
}).strict();
export const tableQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']).optional(),
});

export const orderCreateSchema = z.object({
  userId: objectId,
  tableId: objectId.optional(),
  items: z.array(z.object({
    menuItem: objectId,
    quantity: z.coerce.number().int().positive(),
  }).strict()).min(1),
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().trim().optional(),
}).strict();

export const orderQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled']).optional(),
  userId: objectId.optional(),
});
export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled']),
}).strict();

export const invoiceQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
});
export const employeeQuerySchema = paginationQuerySchema;
export const categoryQuerySchema = paginationQuerySchema.extend({ limit: positiveInt.max(100).default(20) });

export const menuQuerySchema = paginationQuerySchema.extend({
  category: objectId.optional(),
});
export const menuCreateSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  category: objectId,
  price: nonNegativeNumber,
  image: z.string().trim().min(1).optional(),
  isPopular: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  availableQty: z.coerce.number().int().nonnegative().optional(),
  tags: z.array(z.string().trim()).optional(),
}).strict();
export const menuUpdateSchema = menuCreateSchema.partial();

export const inventoryCreateSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().optional(),
  quantity: nonNegativeNumber,
  unit: z.string().trim().min(1),
  unitPrice: nonNegativeNumber,
  supplier: z.string().trim().optional(),
  minStockLevel: z.coerce.number().int().nonnegative().optional(),
  maxStockLevel: z.coerce.number().int().nonnegative().optional(),
  expiryDate: z.coerce.date().optional(),
  lastRestocked: z.coerce.date().optional(),
}).strict();
export const inventoryUpdateSchema = inventoryCreateSchema.partial();

export const reportQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const userQuerySchema = paginationQuerySchema;
export const userAccessUpdateSchema = z.object({
  role: z.enum(['customer', 'cashier', 'chef', 'manager', 'owner', 'platformAdmin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  restaurantId: objectId.optional(),
  branchId: objectId.optional(),
  branch: z.string().trim().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, { message: 'At least one access field is required' });
