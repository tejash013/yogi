import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'cashier', 'chef', 'manager', 'owner', 'admin'],
      default: 'customer',
    },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    branch: { type: String, trim: true },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    lastLoginAt: { type: Date },
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
