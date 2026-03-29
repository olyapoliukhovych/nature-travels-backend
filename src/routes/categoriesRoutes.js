import { Router } from 'express';
import { getCategories } from '../controllers/categoryController.js';

const router = new Router();

router.get('/categories', getCategories);

export default router;
