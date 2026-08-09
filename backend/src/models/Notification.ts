import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default model('Notification', notificationSchema);
