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
  userIdParamSchema,
  verifyTokenSchema,
} from '../validation/updateUserValidation.js';
import {
  paginationSchema,
  storyIdParamSchema,
} from '../validation/storyValidation.js';
import { celebrate } from 'celebrate';

const router = Router();

router.get('/', celebrate(getUsersQuerySchema), getAllUsers);

router.get('/me', authenticate, getCurrentUser);

router.get('/created', authenticate, celebrate(paginationSchema), getMyStories);

router.get(
  '/saved',
  authenticate,
  celebrate(paginationSchema),
  getSavedStories,
);

router.get('/:userId', celebrate(userIdParamSchema), getUserById);

router.get('/me', authenticate, getCurrentUser);

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

// ! not use

router.patch('/me', authenticate, updateUserSchema, updateUser);
router.patch(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

// verification
router.get('/verify/:token', celebrate(verifyTokenSchema), verifyUserEmail);

export default router;
