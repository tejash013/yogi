import { Schema, model } from 'mongoose';
const restaurantSubscriptionSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: {
        type: String,
        enum: ['trial', 'active', 'past_due', 'cancelled', 'expired', 'suspended'],
        default: 'trial',
        index: true,
    },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelledAt: { type: Date },
    provider: { type: String, trim: true },
    providerCustomerId: { type: String, trim: true },
    providerSubscriptionId: { type: String, trim: true },
}, { timestamps: true });
export default model('RestaurantSubscription', restaurantSubscriptionSchema);
