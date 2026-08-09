import { Schema, model } from 'mongoose';

const invoiceSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

export default model('Invoice', invoiceSchema);
