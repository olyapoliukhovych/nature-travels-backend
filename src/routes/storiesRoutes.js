import { Router } from 'express';
import {
  createStory,
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
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const router = Router();

// general lists

router.get('/', celebrate(getStoriesSchema), getStories);
// створити ПУБЛІЧНИЙ ендпоінт для ОТРИМАННЯ історій + фільтр по категріям + пагінція + за типом "popular"

router.patch(
  '/:storyId',
  authenticate,
  celebrate(updateStorySchema),
  updateStory,
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
