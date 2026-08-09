import { Schema, model } from 'mongoose';

const offerSchema = new Schema(
  {
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

export default model('Offer', offerSchema);
