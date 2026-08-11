import { Schema, model } from 'mongoose';

const inventorySchema = new Schema(
  {
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
