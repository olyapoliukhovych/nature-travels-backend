import { Router } from 'express';
import {
  createStory,
  deleteStory,
  getStoryById,
  getStories,
  updateStory,
  getMyStories,
  getSavedStories,
  toggleSaveStory,
} from '../controllers/storyController.js';
import { celebrate } from 'celebrate';
import {
  storyIdParamSchema,
  createStorySchema,
  getStoriesSchema,
  updateStorySchema,
} from '../validation/storyValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/', celebrate(getStoriesSchema), getStories);

router.get('/my', authenticate, getMyStories);
router.get('/saved', authenticate, getSavedStories);

router.patch(
  '/:storyId/save',
  authenticate,
  celebrate(storyIdParamSchema),
  toggleSaveStory,
);

router.get('/:storyId', celebrate(storyIdParamSchema), getStoryById);

router.post('/', authenticate, celebrate(createStorySchema), createStory);

router.patch(
  '/:storyId',
  authenticate,
  celebrate(updateStorySchema),
  updateStory,
);

router.delete(
  '/:storyId',
  authenticate,
  celebrate(storyIdParamSchema),
  deleteStory,
);
export default router;
