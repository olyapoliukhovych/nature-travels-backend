import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  updateUserAvatar,
  updateUser,
  verifyUserEmail,
  deleteStory,
  getCurrentUser,
  getMyStories,
  getSavedStories,
  getUserById,
  saveStory,
} from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';
import { updateUserSchema } from '../validation/updateUserValidation.js';

const router = Router();

router.get('/users/:userId', getUserById);

router.get('/users/me', authenticate, getCurrentUser);
router.post('/users/me/saved/:storyId', authenticate, saveStory);
router.delete('/users/me/saved/:storyId', authenticate, deleteStory);
router.get('/users/me/stories', authenticate, getMyStories);
router.get('/users/me/saved', authenticate, getSavedStories);

router.patch(
  '/users/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

router.patch('/users/me', authenticate, updateUserSchema, updateUser);

router.get('/users/verify/:token', verifyUserEmail);

export default router;
