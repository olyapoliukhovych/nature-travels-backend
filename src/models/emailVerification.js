import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const emailVerificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: COLLECTIONS.USER,
    required: true,
  },
  newEmail: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

export const EmailVerification = model(
  'EmailVerification',
  emailVerificationSchema,
);
