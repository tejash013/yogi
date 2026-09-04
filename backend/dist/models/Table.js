import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';
const tableSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    label: { type: String, required: true, trim: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning'], default: 'available' },
    capacity: { type: Number, required: true },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
}, { timestamps: true });
tableSchema.index({ restaurantId: 1, branchId: 1, label: 1 }, { unique: true });
export default model('Table', tableSchema);
