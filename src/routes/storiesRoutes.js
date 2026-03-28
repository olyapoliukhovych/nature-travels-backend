import { Router } from 'express';
import {
  createStory,
  deleteStory,
  getStoryById,
  getStories,
  updateStory,
} from '../controllers/storyController.js';
import { celebrate } from 'celebrate';
import {
  storyIdParamSchema,
  createStorySchema,
  getStoriesSchema,
  updateStorySchema,
} from '../validation/storyValidation.js';

const router = Router();

router.get('/stories', celebrate(getStoriesSchema), getStories);
router.get('/stories/:storyId', celebrate(storyIdParamSchema), getStoryById);
router.post('/stories', celebrate(createStorySchema), createStory);
router.patch('/stories/:storyId', celebrate(updateStorySchema), updateStory);
router.delete('/stories/:storyId', celebrate(storyIdParamSchema), deleteStory);

export default router;
