import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';
import { saveStoryImgToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getStories = async (req, res) => {
  const { page = 1, perPage = 10, categoryId } = req.query;

  const skip = (page - 1) * perPage;

  const storyQuery = categoryId
    ? Story.find({ categoryId: categoryId })
    : Story.find();

  const [totalItems, stories] = await Promise.all([
    storyQuery.clone().countDocuments(),
    storyQuery
      .clone()
      .populate('categoryId')
      .populate('ownerId', 'name')
      .sort({ rate: -1 })
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

export const getStoryById = async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId)
    .populate('categoryId')
    .populate('ownerId', 'name');

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};

export const createStory = async (req, res) => {
  const { categoryId } = req.body;

  const categoryExists = await Category.findById(categoryId);
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
    $addToSet: { userStories: story._id },
  });

  res.status(201).json(story);
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

  const story = await Story.findById(storyId);
  if (!story) throw createHttpError(404, 'Story not found');

  const user = await User.findById(req.user._id);
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
  const storyIdNormalized = storyId.toString();

  const story = await Story.findById(storyIdNormalized);
  if (!story) throw createHttpError(404, 'Story not found');

  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, 'User not found');

  const isStorySaved = user.savedStories.some(
    (id) => id.toString() === storyIdNormalized,
  );
  if (!isStorySaved) throw createHttpError(404, "Story wasn't saved");

  user.savedStories = user.savedStories.filter(
    (id) => id.toString() !== storyIdNormalized,
  );
  await user.save();

  if (story.savedCount > 0) {
    story.savedCount -= 1;
    await story.save();
  }

  res.status(200).json({ message: 'Story unsaved' });
};

// !! updateStory по не реализован на фронте

// export const updateStory = async (req, res) => {
//   const { storyId } = req.params;

//   if (req.body.category) {
//     const categoryExists = await Category.findById(req.body.category);
//     if (!categoryExists) {
//       throw createHttpError(400, 'Category not found');
//     }
//   }

//   const story = await Story.findOneAndUpdate(
//     { _id: storyId, ownerId: req.user._id },
//     req.body,
//     {
//       returnDocument: 'after',
//     },
//   );

//   if (!story) {
//     throw createHttpError(404, 'Story not found');
//   }

//   res.status(200).json(story);
// };

// !! deleteStory по не реализован на фронте

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
