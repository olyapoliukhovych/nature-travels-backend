import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  updateUserAvatar,
  updateUser,
  verifyUserEmail,
  getCurrentUser,
  getUserById,
  getAllUsers,
  getMyStories,
  getSavedStories,
  saveStory,
  unsaveStory,
} from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';
import {
  getUsersQuerySchema,
  updateUserSchema,
  userParamSchema,
  verifyTokenSchema,
} from '../validation/updateUserValidation.js';
import { celebrate } from 'celebrate';
import {
  paginationSchema,
  storyIdParamSchema,
} from '../validation/storyValidation.js';

const router = Router();

// whole list
router.get('/', celebrate(getUsersQuerySchema), getAllUsers);

// current user (static data first)
router.get('/me', authenticate, getCurrentUser);
router.patch('/me', authenticate, updateUserSchema, updateUser);

router.get('/created', authenticate, celebrate(paginationSchema), getMyStories);

router.get(
  '/saved',
  authenticate,
  celebrate(paginationSchema),
  getSavedStories,
);

router.patch(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

// toggle save unsave story
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

// verification
router.get('/verify/:token', celebrate(verifyTokenSchema), verifyUserEmail);

// public profile of another user
router.get('/:userId', celebrate(userParamSchema), getUserById);

export default router;
