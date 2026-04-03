import createHttpError from 'http-errors';
import { nanoid } from 'nanoid';
import { User } from '../models/user.js';
import { EmailVerification } from '../models/emailVerification.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { sendMail } from '../utils/sendMail.js';
import { EMAIL_VERIFICATION_LIFETIME } from '../constants/time.js';
import { Story } from '../models/story.js';

export const getAllUsers = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const [users, totalItems] = await Promise.all([
    User.find()
      .select('_id name avatarUrl savedStories')
      .skip(skip)
      .limit(perPage)
      .lean(),
    User.countDocuments(),
  ]);

  const userIds = users.map((user) => user._id);

  const stories = await Story.find({
    ownerId: { $in: userIds },
  }).select('_id ownerId');

  const storiesByUserId = {};

  for (const story of stories) {
    const ownerId = String(story.ownerId);

    if (!storiesByUserId[ownerId]) {
      storiesByUserId[ownerId] = [];
    }

    storiesByUserId[ownerId].push(String(story._id));
  }

  for (const user of users) {
    const userId = String(user._id);
    user.savedStories = (user.savedStories ?? []).map(String);
    user.savedStoriesAmount = user.savedStories.length;
    user.totalStories = storiesByUserId[userId] ?? [];
    user.storiesAmount = user.totalStories.length;
  }

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
    users,
  });
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) throw createHttpError(400, 'No file');

  const result = await saveFileToCloudinary(req.file.buffer, req.user._id);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: result.secure_url },
    { new: true },
  );

  res.status(200).json({ url: updatedUser.avatarUrl });
};

export const updateUser = async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, 'User not found');

  if (name) user.name = name;

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, 'Email already in use');

    await EmailVerification.deleteOne({ userId: user._id });

    const token = nanoid();
    await EmailVerification.create({
      userId: user._id,
      newEmail: email,
      token,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_LIFETIME),
    });

    await user.save();

    const verifyLink = `${process.env.FRONTEND_DOMAIN}/verify?token=${token}`;

    await sendMail({
      to: email,
      subject: 'Verify your email',
      html: `<a href="${verifyLink}">Confirm email</a>`,
    });

    return res.json({ message: 'Verification email sent' });
  }

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  res
    .status(200)
    .json({ user: safeUser, message: 'User updated successfully' });
};

export const verifyUserEmail = async (req, res) => {
  const { token } = req.params;

  const verification = await EmailVerification.findOne({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!verification) throw createHttpError(404, 'Invalid or expired token');

  await User.findByIdAndUpdate(verification.userId, {
    email: verification.newEmail,
    emailVerified: true,
  });

  await verification.deleteOne();

  res.status(200).json({ message: 'Email verified successfully' });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const user = await User.findById(userId).select(
    '_id name avatarUrl savedStories',
  );

  if (!user) throw createHttpError(404, 'User not found');

  const storyQuery = Story.find().where('ownerId', userId);

  const [totalItems, stories] = await Promise.all([
    Story.countDocuments(storyQuery.getFilter()),
    storyQuery.clone().populate('category').skip(skip).limit(perPage),
  ]);

  const savedStories = [];

  for (const savedStoryId of user.savedStories ?? []) {
    savedStories.push(String(savedStoryId));
  }

  res.status(200).json({
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      savedStories,
      savedStoriesAmount: savedStories.length,
    },
    stories: {
      page,
      perPage,
      totalItems,
      totalPages: Math.ceil(totalItems / perPage),
      items: stories,
    },
  });
};

export const getCurrentUser = async (req, res) => {
  const [user, totalStories] = await Promise.all([
    User.findById(req.user._id)
      .select('_id name email avatarUrl savedStories')
      .lean(),
    Story.find({ ownerId: req.user._id })
      .select('_id img category title article rate ownerId savedCount date')
      .populate('category')
      .lean(),
  ]);

  if (!user) throw createHttpError(404, 'User not found');

  const savedStories = [];
  for (const storyId of user.savedStories ?? []) {
    savedStories.push(String(storyId));
  }

  res.status(200).json({
    user: {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      savedStories,
      savedStoriesAmount: savedStories.length,
      storiesAmount: totalStories.length,
      totalStories,
    },
  });
};
