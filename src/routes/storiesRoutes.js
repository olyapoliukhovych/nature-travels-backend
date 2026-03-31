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

router.get('/', celebrate(getStoriesSchema), getStories);
// router.get('/populare', getPopulareStories);
router.get('/:storyId', celebrate(storyIdParamSchema), getStoryById);
router.post('/', celebrate(createStorySchema), createStory);
router.patch('/:storyId', celebrate(updateStorySchema), updateStory);
router.delete('/:storyId', celebrate(storyIdParamSchema), deleteStory);

export default router;
