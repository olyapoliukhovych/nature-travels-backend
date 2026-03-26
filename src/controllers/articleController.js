import createHttpError from 'http-errors';
import { Article } from '../models/article.js';

export const getArticles = async (req, res) => {
  const stories = await Article.find();
  res.status(200).json(stories);
};

export const getArticleById = async (req, res) => {
  const { storyId: articleId } = req.params;
  const article = await Article.findById(articleId);

  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  res.status(200).json(article);
};
