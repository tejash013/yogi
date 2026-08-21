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
    isPopular: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    availableQty: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1, branchId: 1, title: 1 });

export default model('MenuItem', menuItemSchema);
