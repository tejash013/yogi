import { Router } from 'express';
export const kitchenRouter = Router();
// Placeholder; implemented later
kitchenRouter.patch('/orders/:orderId/status', (_req, res) => {
    res.status(501).json({ ok: false, error: 'Not implemented' });
});
