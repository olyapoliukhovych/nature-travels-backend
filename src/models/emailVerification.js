import { model, Schema } from 'mongoose';

const emailVerificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  newEmail: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

export const EmailVerification = model(
  'EmailVerification',
  emailVerificationSchema,
);
