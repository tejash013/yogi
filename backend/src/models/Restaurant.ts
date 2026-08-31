import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  gstNumber: { type: String, trim: true },
  tagline: { type: String, trim: true },
  currency: { type: String, default: 'INR' },
  taxRate: { type: Number, default: 5 },
  deliveryFee: { type: Number, default: 40 },
  businessHours: { type: Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default model('Restaurant', restaurantSchema);
