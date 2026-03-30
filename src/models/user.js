import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    storiesAmount: { type: Number, default: 0 },
    savedStories: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.STORY }],
  },
  { timestamps: true, versionKey: false },
);

export const User = model(COLLECTIONS.USER, userSchema);
