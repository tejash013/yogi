import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';
const categorySchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true, default: '🍽️' },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
categorySchema.index({ restaurantId: 1, branchId: 1, name: 1 }, { unique: true });
export default model('Category', categorySchema);
