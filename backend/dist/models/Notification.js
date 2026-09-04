import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';
const notificationSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });
export default model('Notification', notificationSchema);
