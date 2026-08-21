import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';

const userSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'cashier', 'chef', 'manager', 'owner', 'admin', 'platformAdmin'],
      default: 'customer',
    },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    branch: { type: String, trim: true },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    lastLoginAt: { type: Date },
    tokenVersion: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.resetToken;
        delete ret.resetTokenExpires;
        return ret;
      },
    },
  }
);

export default model('User', userSchema);
