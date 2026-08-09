import { Schema, model } from 'mongoose';

const tableSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning'], default: 'available' },
    capacity: { type: Number, required: true },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default model('Table', tableSchema);
