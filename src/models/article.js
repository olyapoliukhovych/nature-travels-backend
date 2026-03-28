import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const articleSchema = new Schema(
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

articleSchema.index(
  { title: 'text' },
  {
    name: 'ArticleTextIndex',
    weights: { title: 10 },
    default_language: 'none',
  },
);

export const Article = model(COLLECTIONS.ARTICLE, articleSchema);
