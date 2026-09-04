import { Router } from 'express';
export const customerRouter = Router();
// Placeholder; implemented later
customerRouter.get('/tables/:tableNumber', (_req, res) => {
    res.json({ ok: true, tableNumber: _req.params.tableNumber });
});
