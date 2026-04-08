import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  updateUserAvatar,
  verifyUserEmail,
  getUserProfile,
  getUserByIdPublic,
  getUserStoriesPublic,
  getAllUsers,
  getUserStoriesFavorites,
  addStoryToFavorites,
  getUserStoriesPrivate,
  deleteStoryToFavorites,
} from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';
import {
  getUsersQuerySchema,
  userParamSchema,
  verifyTokenSchema,
} from '../validation/updateUserValidation.js';
import {
  paginationSchema,
  storyIdParamSchema,
} from '../validation/storyValidation.js';
import { celebrate } from 'celebrate';

const router = Router();

router.get('/', celebrate(getUsersQuerySchema), getAllUsers);

router.get('/me', authenticate, getUserProfile);

router.get(
  '/created',
  authenticate,
  celebrate(paginationSchema),
  getUserStoriesPrivate,
);

router.get(
  '/saved',
  authenticate,
  celebrate(paginationSchema),
  getUserStoriesFavorites,
);

router.get('/:userId', celebrate(userParamSchema), getUserByIdPublic);

router.get('/:userId/public', celebrate(userParamSchema), getUserStoriesPublic);

router.post(
  '/:storyId/save',
  authenticate,
  celebrate(storyIdParamSchema),
  addStoryToFavorites,
);
router.delete(
  '/:storyId/save',
  authenticate,
  celebrate(storyIdParamSchema),
  deleteStoryToFavorites,
);

// ! not use

router.patch(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

// verification
router.get('/verify/:token', celebrate(verifyTokenSchema), verifyUserEmail);

export default router;
