import { Schema, model, Types } from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('RefreshToken', refreshTokenSchema);
