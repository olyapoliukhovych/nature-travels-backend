import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';

export const getStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const { category } = req.query;
  const skip = (page - 1) * perPage;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  const [totalItems, rawStories, selectedCategory] = await Promise.all([
    Story.countDocuments(filter),
    Story.find(filter)
      .populate('category', '_id category')
      .sort({ rate: -1 })
      .skip(skip)
      .limit(perPage),
    category ? Category.findById(category).select('_id category') : null,
  ]);

  const storyIds = rawStories.map((s) => s._id);

  const favoriteCounts = await User.aggregate([
    { $unwind: '$savedStories' },
    { $match: { savedStories: { $in: storyIds } } },
    { $group: { _id: '$savedStories', count: { $sum: 1 } } },
  ]);

  const favoriteMap = {};
  favoriteCounts.forEach(({ _id, count }) => {
    favoriteMap[_id.toString()] = count;
  });

  const stories = rawStories.map((story) => ({
    ...story.toObject(),
    favoritesCount: favoriteMap[story._id.toString()] || 0,
  }));

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
    category: selectedCategory
      ? {
          _id: selectedCategory._id,
          name: selectedCategory.category,
        }
      : null,
    stories,
  });
};

export const saveStory = async (req, res) => {
  const { storyId } = req.params;

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedStories: storyId },
    }),
    Story.findByIdAndUpdate(storyId, { $inc: { savedCount: 1 } }),
  ]);

  res.status(200).json({ message: 'Story saved' });
};

export const unsaveStory = async (req, res) => {
  const { storyId } = req.params;

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $pull: { savedStories: storyId } }),
    Story.findByIdAndUpdate(storyId, { $inc: { savedCount: -1 } }),
  ]);

  res.status(200).json({ message: 'Story unsaved' });
};

export const getStoryById = async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId).populate('category');

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

  const story = await Story.create(req.body);
  res.status(201).json(story);
};

export const deleteStory = async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findOneAndDelete({ _id: storyId });

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};

export const updateStory = async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findOneAndUpdate({ _id: storyId }, req.body, {
    returnDocument: 'after',
  });

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};

// export const getPopulareStories = async (req, res) => {
//   const { page = 1, perPage = 10 } = req.query;
//   const skip = (page - 1) * perPage;

//   const [totalItems, stories] = await Promise.all([
//     Story.countDocuments(),
//     Story.find().populate('_id').sort({ rate: -1 }).skip(skip).limit(perPage),
//   ]);

//   res.status(200).json({
//     page,
//     perPage,
//     totalItems,
//     totalPages: Math.ceil(totalItems / perPage),
//     stories,
//   });
// };
