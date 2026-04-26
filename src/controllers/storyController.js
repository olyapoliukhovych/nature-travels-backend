import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';
import { saveStoryImgToCloudinary } from '../utils/saveFileToCloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

export const getAllStories = async (req, res) => {
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

export const getRecomendStories = async (req, res) => {
  const { categoryId, storyId } = req.query;

  const stories = await Story.find({
    categoryId: categoryId,
    _id: { $ne: storyId },
  })
    .populate('categoryId')
    .populate('ownerId', 'name')
    .sort({
      savedCount: -1,
    })
    .limit(5);

  if (stories.length === 0) {
    throw createHttpError(404, 'Stories not found');
  }

  res.status(200).json(stories);
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

export const updateStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const existingStory = await Story.findOne({
      _id: storyId,
      ownerId: req.user._id,
    });

    if (!existingStory) {
      throw createHttpError(404, 'Story not found or you are not the owner');
    }

    const updateData = {};

    if (req.body.categoryId) updateData.categoryId = req.body.categoryId;
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.article) updateData.article = req.body.article;

    if (req.file) {
      if (existingStory.img) {
        const publicId = existingStory.img.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(`nature-travels-app/img/${publicId}`);
      }

      const result = await saveStoryImgToCloudinary(
        req.file.buffer,
        req.user._id,
      );

      updateData.img = result.secure_url;
    }

    const updatedStory = await Story.findByIdAndUpdate(storyId, updateData, {
      new: true,
      runValidators: true,
    }).populate('categoryId');

    res.status(200).json(updatedStory);
  } catch (error) {
    console.error('UPDATE STORY ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteStory = async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findOne({
    _id: storyId,
    ownerId: req.user._id,
  });

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  // видаляємо фото з cloudinary
  if (story.img) {
    const publicId = story.img.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`nature-travels-app/img/${publicId}`);
  }

  await Story.findByIdAndDelete(storyId);

  // видаляємо згадки у користувачів
  await User.updateMany(
    { savedStories: storyId },
    { $pull: { savedStories: storyId } },
  );

  // зменшуємо лічильник власника
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { userStories: storyId },
    $inc: { totalUserStories: -1 },
  });

  res.status(200).json({ message: 'Story deleted successfully' });
};
