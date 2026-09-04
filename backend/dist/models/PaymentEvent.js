import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';
const paymentEventSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    eventId: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
}, { timestamps: true });
paymentEventSchema.index({ restaurantId: 1, branchId: 1, eventId: 1 }, { unique: true });
export default model('PaymentEvent', paymentEventSchema);
