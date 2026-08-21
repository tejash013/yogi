import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default model('Restaurant', restaurantSchema);
