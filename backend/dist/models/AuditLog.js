import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';
const auditLogSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, trim: true },
    resourceType: { type: String, required: true, trim: true },
    resourceId: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
}, { timestamps: true });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
export default model('AuditLog', auditLogSchema);
