import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
  { versionKey: false },
);

userSchema.pre('save', function () {
  if (!this.username) {
    this.username = this.email;
  }
});

export const User = model(COLLECTIONS.USER, userSchema);
