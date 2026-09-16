import { Schema, model } from 'mongoose';
const subscriptionPlanSchema = new Schema({
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default model('SubscriptionPlan', subscriptionPlanSchema);
