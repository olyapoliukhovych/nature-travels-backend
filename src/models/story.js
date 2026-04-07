import { model, Schema } from 'mongoose';

const storySchema = new Schema(
  {
    img: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    title: { type: String, required: true, trim: true },
    article: { type: String, required: true, trim: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, default: Date.now },
    savedCount: { type: Number, default: 0 },
  },

  {
    versionKey: false,
    timestamps: false,
  },
);

export const Story = model('Story', storySchema);
