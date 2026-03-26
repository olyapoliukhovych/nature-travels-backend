import { Router } from 'express';
import { getStories, getStoryById } from '../controllers/storiesController.js';
import { celebrate } from 'celebrate';

const router = Router();

router.get('/stories', celebrate(), getStories);

router.get('/stories/:storyId', celebrate(), getStoryById);

export default router;
