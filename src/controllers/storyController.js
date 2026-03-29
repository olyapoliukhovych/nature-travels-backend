import createHttpError from 'http-errors';
import { Article } from '../models/story.js';
import { Category } from '../models/category.js';
import { User } from '../models/user.js';

// export const getStories = async (req, res) => {
//   const {
//     page = 1,
//     perPage = 10,
//     category,
//     title,
//     rate,
//     sortBy = '_id',
//     sortOrder = 'desc',
//     search,
//   } = req.query;

//   const skip = (page - 1) * perPage;

//   const storiesQuery = Article.find();

//   if (search) {
//     storiesQuery.where({ $text: { $search: search } });
//   }

//   if (category) {
//     storiesQuery.where('category').equals(category);
//   }

//   if (title) {
//     storiesQuery.where('title').regex(new RegExp(title, 'i'));
//   }

//   if (rate) {
//     storiesQuery.where('rate').equals(Number(rate));
//   }

//   storiesQuery.populate('category', 'name');
//   storiesQuery.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

//   const [totalItems, stories] = await Promise.all([
//     storiesQuery.clone().countDocuments(),
//     storiesQuery.skip(skip).limit(perPage), // прибрав зайвий await
//   ]);

//   const totalPages = Math.ceil(totalItems / perPage);

//   res.status(200).json({
//     page,
//     perPage,
//     totalItems,
//     totalPages,
//     stories,
//   });
// };

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

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (title) filter.title = { $regex: title, $options: 'i' };
  if (rate) filter.rate = Number(rate);

  const [totalItems, rawStories] = await Promise.all([
    Article.countDocuments(filter),
    Article.find(filter)
      .populate('category')
      .populate('ownerId', 'name')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
  ]);

  const stories = await Promise.all(
    rawStories.map(async (story) => {
      const favoritesCount = await User.countDocuments({
        savedArticles: story._id,
      });

      return {
        ...story,
        favoritesCount,
      };
    }),
  );

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
