import { Schema, model } from 'mongoose';
import { DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '../utils/tenant.js';

const invoiceSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, default: DEFAULT_RESTAURANT_ID, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, default: DEFAULT_BRANCH_ID, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, trim: true },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    transactionId: { type: String, trim: true },
    idempotencyKey: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ restaurantId: 1, branchId: 1, order: 1 }, { unique: true });
invoiceSchema.index({ restaurantId: 1, branchId: 1, idempotencyKey: 1 }, { unique: true });

export default model('Invoice', invoiceSchema);
