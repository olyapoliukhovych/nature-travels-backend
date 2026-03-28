import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const storySchema = new Schema(
  {
    img: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTIONS.CATEGORY,
    },
    title: { type: String, required: true, trim: true },
    article: { type: String, required: true, trim: true },
    rate: { type: Number, default: 0 },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USER,
      required: true,
    },
    date: { type: Date, required: true },
    savedCount: { type: Number, default: 0 },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);

storySchema.index(
  { title: 'text' },
  {
    name: 'StoryTextIndex',
    weights: { title: 10 },
    default_language: 'none',
  },
);

export const Article = model(COLLECTIONS.ARTICLE, storySchema);
