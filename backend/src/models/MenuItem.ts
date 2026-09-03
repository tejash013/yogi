import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';

const menuItemSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    image: { type: String, trim: true },
    imageMetadata: {
      provider: { type: String, enum: ['cloudinary', 'external', 'local'], required: false },
      publicId: { type: String, trim: true },
      resourceType: { type: String, trim: true },
      format: { type: String, trim: true },
      bytes: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    isPopular: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1, branchId: 1, title: 1 });

export default model('MenuItem', menuItemSchema);
