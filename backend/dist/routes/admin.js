import { Router } from 'express';
export const adminRouter = Router();
// Placeholder; implemented later
adminRouter.post('/login', (_req, res) => {
    res.status(501).json({ ok: false, error: 'Not implemented' });
});
