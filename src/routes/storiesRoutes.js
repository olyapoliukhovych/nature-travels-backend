import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  updateArticle,
} from '../controllers/articleController.js';
import { celebrate } from 'celebrate';
import {
  articleIdParamSchema,
  createArticleSchema,
  getArticlesSchema,
  updateArticleSchema,
} from '../validation/articleValidation.js';

const router = Router();

router.get('/articles', celebrate(getArticlesSchema), getArticles);

router.get(
  '/articles/:articleId',
  celebrate(articleIdParamSchema),
  getArticleById,
);

router.post('/articles', celebrate(createArticleSchema), createArticle);

router.patch(
  '/articles/:articleId',
  celebrate(updateArticleSchema),
  updateArticle,
);

router.delete(
  '/articles/:articleId',
  celebrate(articleIdParamSchema),
  deleteArticle,
);

export default router;
