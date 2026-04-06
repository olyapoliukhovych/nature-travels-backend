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
    User.find().skip(skip).limit(perPage),
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

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const user = await User.findById(userId);

  if (!user) throw createHttpError(404, 'User not found');

  const storyQuery = Story.find().where('ownerId', userId);

  const [totalItems, stories] = await Promise.all([
    storyQuery.clone().countDocuments(),
    storyQuery.populate('categoryId').skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    user,
    page,
    perPage,
    totalItems,
    totalPages,
    stories,
  });
};

export const getCurrentUser = async (req, res) => {
  const user = req.user;

  if (!user) throw createHttpError(404, 'User not found');

  res.status(200).json(user);
};

export const getMyStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const storyQuery = Story.find({ ownerId: req.user._id });

  const [totalItems, stories] = await Promise.all([
    storyQuery.clone().countDocuments(),
    storyQuery.populate('categoryId').skip(skip).limit(perPage),
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

export const getSavedStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, 'User not found');

  const totalItems = user.savedStories.length;

  const stories = await Story.find({
    _id: { $in: user.savedStories },
  })
    .populate('categoryId')
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

export const saveStory = async (req, res) => {
  const { storyId } = req.params;

  const user = req.user;

  const story = await Story.findById(storyId);

  if (!story) throw createHttpError(404, 'Story not found');

  if (!user) throw createHttpError(404, 'User not found');

  const isArticleSaved = user.savedStories.some(
    (id) => id.toString() === storyId.toString(),
  );
  if (isArticleSaved) {
    return res.status(200).json({ message: 'Story already saved' });
  }

  user.savedStories.push(storyId);

  await user.save();

  story.savedCount += 1;

  await story.save();

  res.status(200).json({ message: 'Story saved' });
};

export const unsaveStory = async (req, res) => {
  const { storyId } = req.params;

  const user = req.user;

  if (!user) throw createHttpError(404, 'User not found');

  const story = await Story.findById(storyId);

  if (!story) throw createHttpError(404, 'Story not found');

  const isStorySaved = user.savedStories.some(
    (id) => id.toString() === storyId.toString(),
  );
  if (!isStorySaved) throw createHttpError(404, "Story wasn't saved");

  user.savedStories.pull(storyId);
  await user.save();

  if (story.savedCount > 0) {
    story.savedCount -= 1;
    await story.save();
  }

  res.status(200).json({ message: 'Story unsaved' });
};

// ! не задействовано

export const updateUserAvatar = async (req, res) => {
  if (!req.file) throw createHttpError(400, 'No file');

  const result = await saveFileToCloudinary(req.file.buffer, req.user._id);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: result.secure_url },
    { returnDocument: 'after' },
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
