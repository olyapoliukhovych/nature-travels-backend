import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  updateUserAvatar,
  updateUser,
  verifyUserEmail,
  getCurrentUser,
  getUserById,
  getAllUsers,
} from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';
import {
  getUsersQuerySchema,
  updateUserSchema,
  userParamSchema,
  verifyTokenSchema,
} from '../validation/updateUserValidation.js';
import { celebrate } from 'celebrate';

const router = Router();

// whole list
router.get('/', celebrate(getUsersQuerySchema), getAllUsers);

// current user (static data first)
router.get('/me', authenticate, getCurrentUser);
router.patch('/me', authenticate, updateUserSchema, updateUser);
router.patch(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

// verification
router.get('/verify/:token', celebrate(verifyTokenSchema), verifyUserEmail);

// public profile of another user
router.get('/:userId', celebrate(userParamSchema), getUserById);

export default router;
