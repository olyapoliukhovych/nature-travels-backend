import { Router } from 'express';
import {
  createStory,
  getStoryById,
  getAllStories,
  getRecomendStories,
  updateStory,
  deleteStory,
} from '../controllers/storyController.js';
import { celebrate } from 'celebrate';
import {
  storyIdParamSchema,
  createStorySchema,
  getStoriesSchema,
  validationRecomendSchema,
  updateStorySchema,
} from '../validation/storyValidation.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.get('/', celebrate(getStoriesSchema), getAllStories);

router.get(
  '/recomend',
  celebrate(validationRecomendSchema),
  getRecomendStories,
);

router.get('/:storyId', celebrate(storyIdParamSchema), getStoryById);

router.post(
  '/',
  authenticate,
  upload.single('img'),
  celebrate(createStorySchema),
  createStory,
);

router.patch(
  '/:storyId',
  authenticate,
  upload.single('img'),
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
