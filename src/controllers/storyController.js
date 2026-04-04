import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';
import { saveStoryImgToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const { category } = req.query;
  const skip = (page - 1) * perPage;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  const storyQuery = Story.find(filter);

  const [rawStories, totalItems, selectedCategory] = await Promise.all([
    storyQuery
      .clone()
      .populate('category', '_id category')
      .sort({ rate: -1 })
      .skip(skip)
      .limit(perPage)
      .exec(),
    storyQuery.clone().countDocuments(),
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

export const getStoryById = async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId).populate('category').populate('ownerId', 'name');;

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

  if (!req.file) {
    throw createHttpError(400, 'No file');
  }

  const result = await saveStoryImgToCloudinary(req.file.buffer, req.user._id);

  const story = await Story.create({
    ...req.body,
    ownerId: req.user._id,
    img: result.secure_url,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { totalStories: story._id },
  });

  res.status(201).json(story);
};

export const getMyStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const storyQuery = Story.find().where('ownerId', req.user._id);

  const [totalItems, stories] = await Promise.all([
    storyQuery.countDocuments(),
    storyQuery.clone().populate('category').skip(skip).limit(perPage),
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

export const saveStory = async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findById(storyId);
  if (!story) throw createHttpError(404, 'Story not found');

  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, 'User not found');

  const isArticleSaved = user.savedStories.some(
    (id) => id.toString() === storyId,
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

  const story = await Story.findById(storyId);
  if (!story) throw createHttpError(404, 'Story not found');

  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, 'User not found');

  const isStorySaved = user.savedStories.some(
    (id) => id.toString() === storyId,
  );
  if (!isStorySaved) throw createHttpError(404, "Story wasn't saved");

  user.savedStories = user.savedStories.filter(
    (id) => id.toString() !== storyId,
  );

  if (story.savedCount > 0) {
    story.savedCount -= 1;
    await story.save();
  }

  res.status(200).json({ message: 'Story unsaved' });
};

export const updateStory = async (req, res) => {
  const { storyId } = req.params;

  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      throw createHttpError(400, 'Category not found');
    }
  }

  const story = await Story.findOneAndUpdate(
    { _id: storyId, ownerId: req.user._id },
    req.body,
    {
      returnDocument: 'after',
    },
  );

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};

// unnessery for now

// export const deleteStory = async (req, res) => {
//   const { storyId } = req.params;
//   const story = await Story.findOneAndDelete({
//     _id: storyId,
//     ownerId: req.user._id,
//   });

//   if (!story) {
//     throw createHttpError(404, 'Story not found');
//   }
//   await User.updateMany(
//     { savedStories: storyId },
//     { $pull: { savedStories: storyId } },
//   );

//   res.status(200).json(story);
// };
