import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';
import { saveStoryImgToCloudinary } from '../utils/saveFileToCloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

export const getStories = async (req, res) => {
  const { page = 1, perPage = 10, categoryId } = req.query;

  const skip = (page - 1) * perPage;

  const storyQuery = categoryId
    ? Story.find({ categoryId: categoryId })
    : Story.find();

  const [totalItems, stories] = await Promise.all([
    storyQuery.clone().countDocuments(),
    storyQuery
      .populate('categoryId')
      .populate('ownerId', 'name')
      .sort({ savedCount: -1 })
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

  const imagePublicId = result.public_id;

  try {
    const story = await Story.create({
      ...req.body,
      ownerId: req.user._id,
      img: result.secure_url,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { userStories: story._id },
      $inc: { totalUserStories: 1 },
    });

    return res.status(201).json({
      message: 'Story created successfully',
      success: true,
    });
  } catch {
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }

    return res.status(400).json({
      message: 'Failed to save story',
      success: false,
    });
  }
};

// !! updateStory не реализован на фронте

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
