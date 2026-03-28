import createHttpError from 'http-errors';
import { Article } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';

export const getStories = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    category,
    title,
    rate,
    sortBy = '_id',
    sortOrder = 'desc',
    search,
  } = req.query;

  const skip = (page - 1) * perPage;

  const storiesQuery = Article.find();

  if (search) {
    storiesQuery.where({ $text: { $search: search } });
  }

  if (category) {
    storiesQuery.where('category').equals(category);
  }

  if (title) {
    storiesQuery.where('title').regex(new RegExp(title, 'i'));
  }

  if (rate) {
    storiesQuery.where('rate').equals(Number(rate));
  }

  storiesQuery.populate('category');
  storiesQuery.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

  const [totalItems, stories] = await Promise.all([
    storiesQuery.clone().countDocuments(),
    storiesQuery.skip(skip).limit(perPage), // прибрав зайвий await
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

export const saveStory = async (req, res) => {
  const { storyId } = req.params;

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedArticles: storyId },
    }),
    Article.findByIdAndUpdate(storyId, { $inc: { savedCount: 1 } }),
  ]);

  res.status(200).json({ message: 'Story saved' });
};

export const unsaveStory = async (req, res) => {
  const { storyId } = req.params;

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $pull: { savedArticles: storyId } }),
    Article.findByIdAndUpdate(storyId, { $inc: { savedCount: -1 } }),
  ]);

  res.status(200).json({ message: 'Story unsaved' });
};

export const getRecommended = async (req, res) => {
  const { page = 1, perPage = 10, category } = req.query;
  if (!category) throw createHttpError(400, 'Category is required');

  const skip = (page - 1) * perPage;
  const filter = { category };

  const [totalItems, stories] = await Promise.all([
    Article.countDocuments(filter),
    Article.find(filter)
      .populate('category')
      .sort({ savedCount: -1 }) // ← просто сортуємо по полю
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

export const getStoryById = async (req, res) => {
  const { storyId } = req.params;
  const story = await Article.findById(storyId).populate('category');

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};

export const createStory = async (req, res) => {
  const { category } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw createHttpError(400, 'Category not found');
  }

  const story = await Article.create(req.body);
  res.status(201).json(story);
};

export const deleteStory = async (req, res) => {
  const { storyId } = req.params;
  const story = await Article.findOneAndDelete({ _id: storyId });

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};

export const updateStory = async (req, res) => {
  const { storyId } = req.params;

  const story = await Article.findOneAndUpdate({ _id: storyId }, req.body, {
    returnDocument: 'after',
  });

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};
