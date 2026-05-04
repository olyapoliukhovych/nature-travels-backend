import createHttpError from 'http-errors';
import { nanoid } from 'nanoid';
import { User } from '../models/user.js';
import { EmailVerification } from '../models/emailVerification.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { sendMail } from '../utils/sendMail.js';
import { EMAIL_VERIFICATION_LIFETIME } from '../constants/time.js';
import { Story } from '../models/story.js';
import { Session } from '../models/session.js';

export const getAllUsers = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const [users, totalItems] = await Promise.all([
    User.find()
      .select('-email')
      .skip(skip)
      .limit(perPage)
      .sort({ totalUserStories: -1 }),
    User.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    users,
  });
};

export const getUserByIdPublic = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-email');

  if (!user) throw createHttpError(404, 'User not found');

  res.status(200).json(user);
};

export const getUserStoriesPublic = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const { userId } = req.params;

  const skip = (page - 1) * perPage;

  const [totalItems, stories] = await Promise.all([
    Story.find({ ownerId: userId }).countDocuments(),
    Story.find({ ownerId: userId })
      .sort({ savedCount: -1, _id: -1 })
      .populate('categoryId')
      .populate('ownerId', 'name')
      .skip(skip)
      .limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    stories,
  });
};

export const getUserProfile = async (req, res) => {
  const user = req.user;

  if (!user) throw createHttpError(404, 'User not found');

  const verification = await EmailVerification.findOne({
    userId: user._id,
    expiresAt: { $gt: new Date() },
  });

  const pendingEmail = verification?.newEmail || null;

  const safeUser = user.toObject();
  delete safeUser.password;

  res.status(200).json({
    ...safeUser,
    pendingEmail,
  });
};

export const addStoryToFavorites = async (req, res) => {
  const { storyId } = req.params;

  const user = req.user;

  const story = await Story.findById(storyId);

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  if (story.ownerId.toString() === user._id.toString()) {
    throw createHttpError(400, 'You cannot save your own story');
  }

  const isStorySaved = user.savedStories.some(
    (id) => id.toString() === storyId.toString(),
  );

  if (isStorySaved) {
    return res.status(200).json({ message: 'Story already saved' });
  }

  await Promise.all([
    Story.findByIdAndUpdate(storyId, { $inc: { savedCount: 1 } }),
    User.findByIdAndUpdate(user._id, { $addToSet: { savedStories: storyId } }),
  ]);

  res.status(200).json({ message: 'Story saved' });
};

export const deleteStoryToFavorites = async (req, res) => {
  const { storyId } = req.params;

  const user = req.user;

  const isStorySaved = user.savedStories.some(
    (id) => id.toString() === storyId.toString(),
  );

  if (!isStorySaved) throw createHttpError(404, "Story wasn't saved");

  const story = await Story.findById(storyId);

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  await Promise.all([
    User.findByIdAndUpdate(user._id, {
      $pull: { savedStories: storyId },
    }),
    Story.findByIdAndUpdate(storyId, {
      $inc: { savedCount: -1 },
    }),
  ]);

  res.status(200).json({ message: 'Story unsaved' });
};

export const getUserStoriesPrivate = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;

  const user = req.user;

  const skip = (page - 1) * perPage;

  const totalItems = user.userStories.length;

  const stories = await Story.find({
    _id: { $in: user.userStories },
  })
    .populate('categoryId')
    .populate('ownerId', 'name')
    .sort({ savedCount: -1 })
    .skip(skip)
    .limit(perPage);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    stories,
  });
};

export const getUserStoriesFavorites = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;

  const user = req.user;

  const skip = (page - 1) * perPage;

  const totalItems = user.savedStories.length;

  const stories = await Story.find({
    _id: { $in: user.savedStories },
  })
    .populate('categoryId')
    .populate('ownerId', 'name')
    .skip(skip)
    .sort({ savedCount: -1 })
    .limit(perPage);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    stories,
  });
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) throw createHttpError(400, 'No file');

  const result = await saveFileToCloudinary(req.file.buffer, req.user._id);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: result.secure_url },
    { returnDocument: 'after' },
  );

  res.status(200).json({
    avatarUrl: updatedUser.avatarUrl,
  });
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
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `<a href="${verifyLink}">Confirm email</a>`,
    });

    return res.json({
      message: 'Verification email sent',
      pendingEmail: email,
    });
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

export const deleteUser = async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  // отримуємо всі історії користувача, щоб видалити посилання на них у інших користувачів
  const userStories = await Story.find({ ownerId: userId }).select('_id');
  const storyIds = userStories.map((story) => story._id);

  // видаляємо посилання на історії у інших користувачів
  if (storyIds.length > 0) {
    await User.updateMany(
      { savedStories: { $in: storyIds } },
      { $pull: { savedStories: { $in: storyIds } } },
    );
  }

  // зменшуємо savedCount для історій, які користувач мав збережені
  if (user.savedStories && user.savedStories.length > 0) {
    await Story.updateMany(
      { _id: { $in: user.savedStories } },
      { $inc: { savedCount: -1 } },
    );
  }

  await Promise.all([
    User.findByIdAndDelete(userId),
    Story.deleteMany({ ownerId: userId }),
    Session.deleteMany({ userId }),
  ]);

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({ message: 'User deleted' });
};
