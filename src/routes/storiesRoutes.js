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
import { upload } from '../middleware/multer.js';

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

// !! updateStory  не реализован на фронте

// router.patch(
//   '/:storyId',
//   authenticate,
//   celebrate(updateStorySchema),
//   updateStory,
// );

// toggle save story

router.post(
  '/:storyId/save',
  authenticate,
  celebrate(storyIdParamSchema),
  saveStory,
);
router.delete(
  '/:storyId/save',
  authenticate,
  celebrate(storyIdParamSchema),
  unsaveStory,
);

// actions with specific story
router.get('/:storyId', celebrate(storyIdParamSchema), getStoryById);
router.post(
  '/',
  authenticate,
  upload.single('img'),
  celebrate(createStorySchema),
  createStory,
);

export default router;

// unnessery for now

// router.delete(
//   '/:storyId',
//   authenticate,
//   celebrate(storyIdParamSchema),
//   deleteStory,
// );
