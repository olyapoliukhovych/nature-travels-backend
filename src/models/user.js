import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    articlesAmount: { type: Number, default: 0 },
    savedStories: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.ARTICLE }],
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre('save', function (next) {
  if (!this.username) {
    this.username = this.email;
  }
  next();
});

export const User = model(COLLECTIONS.USER, userSchema);
