import { Router } from 'express';
import { userRepo, orderRepo } from '../repos/index.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';
import { getIO } from '../socket/socketServer.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, orderCreateSchema, orderQuerySchema, orderStatusSchema } from '../validation/schemas.js';
import { authenticate, optionalAuth, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { recordAudit } from '../utils/audit.js';
import { tenantFilter } from '../utils/tenant.js';
const router = Router();
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
function emitOrderEvent(event, order, payload) {
    try {
        const io = getIO();
        const ownerId = String(order.user?._id ?? order.user);
        const tenant = `${order.restaurantId}:${order.branchId}`;
        io.to(`${tenant}:user:${ownerId}`).emit(event, payload);
        io.to(`${tenant}:staff:orders`).emit(event, payload);
        io.emit(event, order);
        io.emit('order:update', order);
    }
    catch {
        // Socket.IO is optional for HTTP operation.
    }
}
router.get('/', authenticate, requirePermission(permissions.orderRead), validateQuery(orderQuerySchema), async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = String(req.query.status ?? '').trim();
    const userId = String(req.query.userId ?? '').trim();
    const filter = {};
    Object.assign(filter, tenantFilter(req));
    if (status)
        filter.status = status;
    if (req.user.role === 'customer')
        filter.user = req.user.id;
    else if (userId)
        filter.user = userId;
    const { items, total } = await orderRepo.findPaginated(filter, page, limit, { createdAt: -1 });
    return res.json(paginated(items, total, page, limit));
});
router.get('/my-orders', authenticate, requirePermission(permissions.orderRead), validateQuery(orderQuerySchema.pick({ userId: true })), async (req, res) => {
    const userId = req.user.id;
    const orders = await orderRepo.findByUser(userId, tenantFilter(req));
    return res.json(success(orders, 'User orders loaded'));
});
router.get('/:id', authenticate, requirePermission(permissions.orderRead), validateParams(idParamSchema), async (req, res) => {
    const order = await orderRepo.findById(req.params.id, tenantFilter(req));
    if (!order) {
        return res.status(404).json(failure('Order not found'));
    }
    if (req.user.role === 'customer' && String(order.user?._id ?? order.user) !== req.user.id) {
        return res.status(403).json(failure('You do not have access to this order'));
    }
    return res.json(success(order, 'Order loaded'));
});
router.patch('/:id/status', authenticate, requirePermission(permissions.orderStatus), validateParams(idParamSchema), validateBody(orderStatusSchema), async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json(failure('Status is required'));
    }
    const order = await orderRepo.updateById(req.params.id, { status }, tenantFilter(req));
    if (!order) {
        return res.status(404).json(failure('Order not found'));
    }
    // If order was attached to a table and has finished, update table status in database
    if (order.table && (status === 'completed' || status === 'cancelled')) {
        const tableId = order.table._id ?? order.table;
        const activeOrders = await orderRepo.findPaginated({
            table: tableId,
            status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] },
            _id: { $ne: order._id },
            ...tenantFilter(req),
        }, 1, 1);
        if (!activeOrders || activeOrders.total === 0) {
            const nextStatus = status === 'completed' ? 'cleaning' : 'available';
            const updatedTable = await Table.findOneAndUpdate({ _id: tableId, ...tenantFilter(req) }, { status: nextStatus }, { new: true }).exec();
            if (updatedTable) {
                try {
                    const io = getIO();
                    io.emit('table:status:update', { tableId: updatedTable._id, status: updatedTable.status, label: updatedTable.label });
                }
                catch {
                    // Socket is optional
                }
            }
        }
    }
    emitOrderEvent('order:status:update', order, { id: order.id, status: order.status });
    await recordAudit({
        actor: req.user.id,
        action: 'order.status_updated',
        resourceType: 'Order',
        resourceId: String(order._id),
        metadata: { status },
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    return res.json(success(order, 'Order status updated'));
});
router.get('/:id/track', authenticate, requirePermission(permissions.orderRead), validateParams(idParamSchema), async (req, res) => {
    const order = await orderRepo.findById(req.params.id, tenantFilter(req));
    if (!order) {
        return res.status(404).json(failure('Order not found'));
    }
    if (req.user.role === 'customer' && String(order.user?._id ?? order.user) !== req.user.id) {
        return res.status(403).json(failure('You do not have access to this order'));
    }
    return res.json(success({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        estimatedReadyAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        updatedAt: order.updatedAt,
    }, 'Order tracking data loaded'));
});
router.post('/', optionalAuth, validateBody(orderCreateSchema), async (req, res) => {
    const { userId, tableId, items: orderItems = [], orderType, paymentStatus, notes } = req.body;
    const authenticatedUser = req.user;
    const tenant = tenantFilter(req);
    if (authenticatedUser?.role === 'customer' && userId && String(userId) !== String(authenticatedUser.id)) {
        return res.status(403).json(failure('Cannot create order for another user'));
    }
    let user = null;
    if (authenticatedUser) {
        user = await userRepo.findById(authenticatedUser.id);
    }
    else if (userId && String(userId).match(/^[a-fA-F0-9]{24}$/)) {
        user = await userRepo.findById(userId);
    }
    if (!user) {
        user = await userRepo.findByEmail('guest@yogirestaurant.com');
    }
    if (!user) {
        try {
            user = await userRepo.create({
                firstName: 'Guest',
                lastName: 'Customer',
                email: 'guest@yogirestaurant.com',
                phone: '+91 99999 99999',
                role: 'customer',
                restaurantId: tenant.restaurantId,
                branchId: tenant.branchId,
                status: 'active',
                tokenVersion: 1,
            });
        }
        catch {
            user = await userRepo.findByEmail('guest@yogirestaurant.com');
        }
    }
    if (!user) {
        return res.status(500).json(failure('Failed to process guest user account'));
    }
    let resolvedTableId = undefined;
    if (tableId) {
        let table = null;
        if (String(tableId).match(/^[a-fA-F0-9]{24}$/)) {
            table = await Table.findOne({ _id: tableId, ...tenant }).exec();
        }
        if (!table) {
            const num = Number.parseInt(String(tableId).replace(/\D/g, ''), 10);
            table = await Table.findOne({
                $or: [
                    { label: new RegExp(`^(Table\\s*)?${tableId}$`, 'i') },
                    ...(Number.isFinite(num) ? [{ label: new RegExp(`^(Table\\s*)?${num}$`, 'i') }] : []),
                ],
                ...tenant,
            }).exec();
        }
        if (table) {
            if (authenticatedUser?.role === 'customer' && table.status === 'occupied') {
                const activeOccupantOrder = await orderRepo.findPaginated({
                    table: table._id,
                    user: { $ne: user._id },
                    status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] },
                    ...tenant,
                }, 1, 1);
                if (activeOccupantOrder && activeOccupantOrder.total > 0) {
                    return res.status(400).json(failure(`Table ${table.label} is currently occupied by another guest. Please choose an available table.`));
                }
            }
            resolvedTableId = table._id;
            await Table.updateOne({ _id: table._id }, { status: 'occupied' }).exec();
            try {
                const io = getIO();
                io.emit('table:status:update', { tableId: table._id, status: 'occupied', label: table.label });
            }
            catch {
                // Socket is optional
            }
        }
    }
    let resolvedItems = [];
    let subtotal = 0;
    let taxes = 0;
    let total = 0;
    if (Array.isArray(orderItems) && orderItems.length > 0) {
        const items = await Promise.all(orderItems.map(async (item) => {
            const itemId = item.menuItem || item.id;
            const menuItem = String(itemId).match(/^[a-fA-F0-9]{24}$/)
                ? await MenuItem.findOne({ _id: itemId, ...tenant }).exec()
                : await MenuItem.findOne({ title: new RegExp(`^${item.name || ''}$`, 'i'), ...tenant }).exec();
            if (!menuItem || !menuItem.isActive)
                return null;
            return {
                menuItem: menuItem._id,
                quantity: item.quantity || 1,
                unitPrice: menuItem.price,
            };
        }));
        resolvedItems = items.filter((item) => item !== null);
        subtotal = resolvedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        taxes = 0;
        total = Number(subtotal.toFixed(2));
    }
    let order;
    order = await orderRepo.create({
        ...tenant,
        user: user._id,
        table: resolvedTableId,
        items: resolvedItems,
        orderType: orderType || 'dine-in',
        deliveryAddress: req.body.deliveryAddress ? String(req.body.deliveryAddress).trim() : undefined,
        paymentStatus: authenticatedUser?.role === 'customer' ? 'pending' : paymentStatus || 'pending',
        subtotal,
        taxes,
        total,
        notes,
    });
    emitOrderEvent('order:created', order, { id: order.id, user: order.user, total: order.total });
    await recordAudit({
        actor: authenticatedUser?.id || String(user._id),
        action: 'order.created',
        resourceType: 'Order',
        resourceId: String(order._id),
        metadata: { total: order.total, itemCount: order.items.length },
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    return res.status(201).json(success(order, 'Order created successfully'));
});
router.put('/:id', authenticate, requirePermission(permissions.orderCreate), async (req, res) => {
    const { items: orderItems, tableId, orderType, paymentStatus, notes } = req.body;
    const tenant = tenantFilter(req);
    const existingOrder = await orderRepo.findById(req.params.id, tenant);
    if (!existingOrder) {
        return res.status(404).json(failure('Order not found'));
    }
    let resolvedItems = existingOrder.items.map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
    }));
    let subtotal = existingOrder.subtotal;
    let taxes = existingOrder.taxes;
    let total = existingOrder.total;
    if (Array.isArray(orderItems)) {
        const items = await Promise.all(orderItems.map(async (item) => {
            const itemId = item.menuItem || item.id;
            const menuItem = String(itemId).match(/^[a-fA-F0-9]{24}$/)
                ? await MenuItem.findOne({ _id: itemId, ...tenant }).exec()
                : await MenuItem.findOne({ title: new RegExp(`^${item.name || ''}$`, 'i'), ...tenant }).exec();
            if (!menuItem)
                return null;
            return {
                menuItem: menuItem._id,
                quantity: item.quantity || 1,
                unitPrice: menuItem.price,
            };
        }));
        resolvedItems = items.filter((item) => item !== null);
        subtotal = resolvedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        taxes = 0;
        total = Number(subtotal.toFixed(2));
    }
    const updatedOrder = await orderRepo.updateById(req.params.id, {
        ...(Array.isArray(orderItems) ? { items: resolvedItems, subtotal, taxes, total } : {}),
        ...(tableId ? { table: tableId } : {}),
        ...(orderType ? { orderType } : {}),
        ...(req.body.deliveryAddress !== undefined ? { deliveryAddress: String(req.body.deliveryAddress).trim() } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(notes !== undefined ? { notes } : {}),
    }, tenant);
    if (!updatedOrder) {
        return res.status(404).json(failure('Order not found'));
    }
    emitOrderEvent('order:update', updatedOrder, { id: updatedOrder.id });
    return res.json(success(updatedOrder, 'Order updated successfully'));
});
export default router;
