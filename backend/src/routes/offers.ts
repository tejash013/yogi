import { Router } from 'express';
import { offers, coupons } from '../data/mockData.js';
import { success, failure } from '../utils/response.js';

const router = Router();

router.get('/', (_req, res) => {
  return res.json(success(offers, 'Offers loaded'));
});

router.get('/coupons', (_req, res) => {
  return res.json(success(coupons, 'Coupons loaded'));
});

router.post('/validate-coupon', (req, res) => {
  const { code } = req.body;
  const coupon = coupons.find((item) => item.code === code);
  if (!coupon) {
    return res.status(404).json(failure('Coupon not found'));
  }

  return res.json(success(coupon, 'Coupon validated successfully'));
});

export default router;
