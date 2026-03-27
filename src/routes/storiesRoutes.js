import { Router } from 'express';
import {
  getArticleById,
  getArticles,
} from '../controllers/articleController.js';
import { celebrate } from 'celebrate';

const router = Router();

router.get('/articles', getArticles);

router.get('/articles/:articleId', getArticleById);

export default router;
