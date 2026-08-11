import { Router } from 'express';
import Offer from '../models/Offer.js';
import { success, failure } from '../utils/response.js';

const router = Router();

router.get('/', async (_req, res) => {
  const offers = await Offer.find({ offerType: 'offer', isActive: true }).sort({ validUntil: 1 }).exec();
  return res.json(success(offers, 'Offers loaded'));
});

router.get('/coupons', async (_req, res) => {
  const coupons = await Offer.find({ offerType: 'coupon', isActive: true }).sort({ validUntil: 1 }).exec();
  return res.json(success(coupons, 'Coupons loaded'));
});

router.post('/validate-coupon', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json(failure('Coupon code is required'));
  }

  const coupon = await Offer.findOne({
    offerType: 'coupon',
    code,
    isActive: true,
    validUntil: { $gte: new Date() },
  }).exec();

  if (!coupon) {
    return res.status(404).json(failure('Coupon not found or expired'));
  }

  return res.json(success(coupon, 'Coupon validated successfully'));
});

router.post('/', async (req, res) => {
  const { title, description, discountType, discountValue, validUntil, terms, offerType, code } = req.body;
  if (!title || !discountType || discountValue == null) {
    return res.status(400).json(failure('Title, discountType, and discountValue are required'));
  }

  const offer = new Offer({
    title,
    description,
    discountType,
    discountValue,
    validUntil,
    terms,
    offerType: offerType ?? 'offer',
    code,
  });

  await offer.save();
  return res.status(201).json(success(offer, 'Offer created successfully'));
});

router.patch('/:id', async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!offer) {
    return res.status(404).json(failure('Offer not found'));
  }

  return res.json(success(offer, 'Offer updated successfully'));
});

router.delete('/:id', async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).exec();
  if (!offer) {
    return res.status(404).json(failure('Offer not found'));
  }

  return res.json(success(offer, 'Offer deactivated successfully'));
});

export default router;
