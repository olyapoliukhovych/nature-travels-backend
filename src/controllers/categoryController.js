import { Category } from '../models/category.js';
import createHttpError from 'http-errors';

export const getCategories = async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    throw createHttpError(404, 'Categories not found');
  }

  res.status(200).json(categories);
};
