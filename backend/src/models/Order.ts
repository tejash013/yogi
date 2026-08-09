import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    table: { type: Schema.Types.ObjectId, ref: 'Table' },
    items: { type: [orderItemSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderType: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'dine-in' },
    subtotal: { type: Number, required: true, default: 0 },
    taxes: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default model('Order', orderSchema);
