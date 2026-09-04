import { Schema, model } from 'mongoose';
const branchSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    branchCode: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    managerName: { type: String, trim: true },
    address: { type: String, trim: true },
    addressDetails: {
        street: { type: String, trim: true },
        landmark: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'India' },
    },
    latitude: { type: Number },
    longitude: { type: Number },
    businessHours: { type: Schema.Types.Mixed, default: {} },
    seatingCapacity: { type: Number, default: 40 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
branchSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });
export default model('Branch', branchSchema);
