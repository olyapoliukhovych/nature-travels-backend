import { Router } from 'express';
import {
  createStory,
  getStoryById,
  getStories,
  getMyStories,
  getSavedStories,
  saveStory,
  unsaveStory,
} from '../controllers/storyController.js';
import { celebrate } from 'celebrate';
import {
  storyIdParamSchema,
  createStorySchema,
  getStoriesSchema,
  paginationSchema,
} from '../validation/storyValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// general lists
router.get('/created', authenticate, celebrate(paginationSchema), getMyStories);
router.get(
  '/saved',
  authenticate,
  celebrate(paginationSchema),
  getSavedStories,
);
router.get('/', celebrate(getStoriesSchema), getStories);

// toggle save story
(router.post(
  '/story:id/save',
  authenticate,
  celebrate(storyIdParamSchema),
  saveStory,
),
  router.delete(
    '/story:id/save',
    authenticate,
    celebrate(storyIdParamSchema),
    unsaveStory,
  ));

// actions with specific story
router.get('/:storyId', celebrate(storyIdParamSchema), getStoryById);
router.post('/', authenticate, celebrate(createStorySchema), createStory);

export default router;

// unnessery for now
// router.patch(
//   '/:storyId',
//   authenticate,
//   celebrate(updateStorySchema),
//   updateStory,
// );
// router.delete(
//   '/:storyId',
//   authenticate,
//   celebrate(storyIdParamSchema),
//   deleteStory,
// );
