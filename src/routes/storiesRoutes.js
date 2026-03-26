import { Router } from 'express';
import {
  getArticleById,
  getArticles,
} from '../controllers/articleController.js';
import { celebrate } from 'celebrate';

const router = Router();

router.get('/articles', celebrate(), getArticles);

router.get('/articles/:articleId', celebrate(), getArticleById);

export default router;
