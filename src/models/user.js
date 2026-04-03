import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    savedStories: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.ARTICLE }],
  },
  { timestamps: false, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.index(
  { name: 'text' },
  {
    name: 'UserTextIndex',
    weights: { name: 10 },
    default_language: 'none',
  },
);

export const User = model(COLLECTIONS.USER, userSchema);
