import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';

const offerSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    terms: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    offerType: { type: String, enum: ['offer', 'coupon'], default: 'offer' },
    code: { type: String, trim: true },
  },
  { timestamps: true }
);

offerSchema.index(
  { restaurantId: 1, branchId: 1, code: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { code: { $type: 'string' } },
  }
);

export default model('Offer', offerSchema);
