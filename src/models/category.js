import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { versionKey: false, timestamps: true },
);

export const Category = model(COLLECTIONS.CATEGORY, categorySchema);
