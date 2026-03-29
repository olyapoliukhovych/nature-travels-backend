import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    articlesAmount: { type: Number, default: 0 },
    savedArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
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
