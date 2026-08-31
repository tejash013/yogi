import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';

const reviewSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    subject: { type: String, trim: true },
    comment: { type: String, trim: true },
    images: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

reviewSchema.index({ restaurantId: 1, branchId: 1, menuItem: 1, user: 1 }, { unique: true });

export default model('Review', reviewSchema);