import createHttpError from 'http-errors';
import { Article } from '../models/article.js';
import { Category } from '../models/category.js';

export const getArticles = async (req, res) => {
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

  const articlesQuery = Article.find();

  if (search) {
    articlesQuery.where({ $text: { $search: search } });
  }

  if (category) {
    articlesQuery.where('category').equals(category);
  }

  if (title) {
    articlesQuery.where('title').regex(new RegExp(title, 'i'));
  }

  if (rate) {
    articlesQuery.where('rate').equals(Number(rate));
  }

  articlesQuery.populate('category');

  articlesQuery.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

  const [totalItems, articles] = await Promise.all([
    articlesQuery.clone().countDocuments(),
    await articlesQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    articles,
  });
};

export const getArticleById = async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findById(articleId);

  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  res.status(200).json(article);
};

export const createArticle = async (req, res) => {
  const article = await Article.create(req.body);
  const { category } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw createHttpError(400, 'Category not found');
  }

  res.status(201).json(article);
};

export const deleteArticle = async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findOneAndDelete({
    _id: articleId,
  });

  if (!article) {
    throw createHttpError(404, 'Article not found');
  }
  res.status(200).json(article);
};

export const updateArticle = async (req, res) => {
  const { articleId } = req.params;

  const article = await Article.findOneAndUpdate({ _id: articleId }, req.body, {
    returnDocument: 'after',
  });

  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  res.status(200).json(article);
};
