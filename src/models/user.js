import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    avatarUrl: {
      type: String,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
    totalUserStories: { type: Number, default: 0 },
    savedStories: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    userStories: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: false, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model('User', userSchema);
