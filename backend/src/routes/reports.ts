import { Router } from 'express';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';
import { success, failure } from '../utils/response.js';
import { validateQuery } from '../middleware/validate.js';
import { reportQuerySchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';

const router = Router();

function parseDate(value: unknown, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date;
}

router.get('/sales', authenticate, requirePermission(permissions.reportsRead), validateQuery(reportQuerySchema), async (req, res) => {
  const startDate = parseDate(req.query.startDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const endDate = parseDate(req.query.endDate, new Date());

  if (startDate > endDate) {
    return res.status(400).json(failure('startDate must be before endDate'));
  }

  const orders = await Order.find({
    ...tenantFilter(req),
    createdAt: { $gte: startDate, $lte: endDate },
    paymentStatus: 'paid',
  })
    .populate('items.menuItem', 'title')
    .exec();

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders ? Number((totalSales / totalOrders).toFixed(2)) : 0;

  const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      const menuItem = item.menuItem as any;
      const key = String(menuItem?._id ?? item.menuItem);
      const existing = itemMap.get(key) ?? { name: menuItem?.title ?? 'Unknown item', quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * item.unitPrice;
      itemMap.set(key, existing);
    });
  });

  const topSellingItems = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return res.json(
    success(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalSales,
        totalOrders,
        averageOrderValue,
        topSellingItems,
      },
      'Sales report loaded'
    )
  );
});

router.get('/revenue', authenticate, requirePermission(permissions.reportsRead), validateQuery(reportQuerySchema), async (req, res) => {
  const startDate = parseDate(req.query.startDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const endDate = parseDate(req.query.endDate, new Date());

  if (startDate > endDate) {
    return res.status(400).json(failure('startDate must be before endDate'));
  }

  const invoices = await Invoice.find({
    ...tenantFilter(req),
    issuedAt: { $gte: startDate, $lte: endDate },
    status: 'paid',
  }).exec();

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const inventoryItems = await Inventory.find({ ...tenantFilter(req), isActive: true }).exec();
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const orderTaxes = await Order.aggregate([
    { $match: { ...tenantFilter(req), createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, totalTaxes: { $sum: '$taxes' } } },
  ]).exec();
  const totalTaxes = orderTaxes?.[0]?.totalTaxes ?? 0;
  const totalExpenses = Number((inventoryValue + totalTaxes).toFixed(2));
  const profit = Number((totalRevenue - totalExpenses).toFixed(2));

  return res.json(
    success(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalRevenue,
        totalExpenses,
        profit,
        inventoryValue,
        totalTaxes,
      },
      'Revenue report loaded'
    )
  );
});

router.get('/expenses', authenticate, requirePermission(permissions.reportsRead), validateQuery(reportQuerySchema), async (req, res) => {
  const startDate = parseDate(req.query.startDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const endDate = parseDate(req.query.endDate, new Date());

  if (startDate > endDate) {
    return res.status(400).json(failure('startDate must be before endDate'));
  }

  const inventoryItems = await Inventory.find({ ...tenantFilter(req), isActive: true }).exec();
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const orderTaxes = await Order.aggregate([
    { $match: { ...tenantFilter(req), createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, totalTaxes: { $sum: '$taxes' } } },
  ]).exec();
  const totalTaxes = orderTaxes?.[0]?.totalTaxes ?? 0;
  const totalExpenses = Number((inventoryValue + totalTaxes).toFixed(2));

  return res.json(
    success(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalExpenses,
        inventoryValue,
        totalTaxes,
      },
      'Expenses report loaded'
    )
  );
});

export default router;
