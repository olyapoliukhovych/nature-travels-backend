import createHttpError from 'http-errors';
import { Article } from '../models/story.js';
import { User } from '../models/user.js';

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, perPage = 10 } = req.query;

  const user = await User.findById(userId);

  if (!user) throw createHttpError(404, 'User not found');

  const skip = (page - 1) * perPage;

  const [totalItems, stories] = await Promise.all([
    Article.countDocuments({ ownerId: userId }),
    Article.find({ ownerId: userId })
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

export const getMyStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const [totalItems, stories] = await Promise.all([
    Article.countDocuments({ ownerId: req.user._id }),
    Article.find({ ownerId: req.user._id })
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

  const totalItems = user.savedArticles.length;

  const stories = await Article.find({
    _id: { $in: user.savedArticles },
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
