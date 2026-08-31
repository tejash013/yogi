import { Schema, model } from 'mongoose';

const branchSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true },
  address: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

branchSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });

export default model('Branch', branchSchema);
