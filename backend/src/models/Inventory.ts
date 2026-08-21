import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';

const inventorySchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, trim: true },
    unitPrice: { type: Number, required: true, default: 0 },
    supplier: { type: String, trim: true },
    minStockLevel: { type: Number, default: 0 },
    maxStockLevel: { type: Number, default: 0 },
    expiryDate: { type: Date },
    lastRestocked: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model('Inventory', inventorySchema);
