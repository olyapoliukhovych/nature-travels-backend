import { Schema, model } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USER,
      required: true,
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Session = model(COLLECTIONS.SESSION, sessionSchema);
