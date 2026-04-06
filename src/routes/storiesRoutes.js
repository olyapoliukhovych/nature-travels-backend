import { Router } from 'express';
import {
  createStory,
  getStoryById,
  getStories,
} from '../controllers/storyController.js';
import { celebrate } from 'celebrate';
import {
  storyIdParamSchema,
  createStorySchema,
  getStoriesSchema,
} from '../validation/storyValidation.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const router = Router();

// general lists

router.get('/', celebrate(getStoriesSchema), getStories);

router.get('/:storyId', celebrate(storyIdParamSchema), getStoryById);

router.post(
  '/',
  authenticate,
  upload.single('img'),
  celebrate(createStorySchema),
  createStory,
);

export default router;

// !! updateStory  не реализован на фронте

// router.patch(
//   '/:storyId',
//   authenticate,
//   celebrate(updateStorySchema),
//   updateStory,
// );

// toggle save story

// actions with specific story

// unnessery for now

// router.delete(
//   '/:storyId',
//   authenticate,
//   celebrate(storyIdParamSchema),
//   deleteStory,
// );
