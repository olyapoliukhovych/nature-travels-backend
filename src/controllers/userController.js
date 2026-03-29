import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { User } from '../models/user.js';

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, perPage = 10 } = req.query;

  const user = await User.findById(userId);
  if (!user) throw createHttpError(404, 'User not found');

  const skip = (page - 1) * perPage;

  const [totalItems, stories] = await Promise.all([
    Story.countDocuments({ ownerId: userId }),
    Story.find({ ownerId: userId })
      .populate('category')
      .skip(skip)
      .limit(perPage),
  ]);

  res.status(200).json({
    user,
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
  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, 'User not found');
  res.status(200).json(user);
};

export const saveStory = async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findById(storyId);
  if (!story) throw createHttpError(404, 'Story not found');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedStories: storyId } },
    { new: true },
  );

  res.status(200).json(user);
};

export const deleteStory = async (req, res) => {
  const { storyId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedStories: storyId } },
    { new: true },
  );

  res.status(200).json(user);
};

export const getMyStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const [totalItems, stories] = await Promise.all([
    Story.countDocuments({ ownerId: req.user._id }),
    Story.find({ ownerId: req.user._id })
      .populate('category')
      .skip(skip)
      .limit(perPage),
  ]);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
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
    .populate('category')
    .skip(skip)
    .limit(perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
    stories,
  });
};
