import { Schema, model } from 'mongoose';

const menuItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    image: { type: String, trim: true },
    isPopular: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    availableQty: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default model('MenuItem', menuItemSchema);
