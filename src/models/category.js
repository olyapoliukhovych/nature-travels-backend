import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const categorySchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { versionKey: false },
);

export const Category = model(COLLECTIONS.CATEGORY, categorySchema);
