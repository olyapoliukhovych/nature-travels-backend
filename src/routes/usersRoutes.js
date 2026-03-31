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
import { updateUserSchema } from '../validation/updateUserValidation.js';

const router = Router();
router.get('/', getAllUsers);

router.get('/me', authenticate, getCurrentUser);

router.patch(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

router.patch('/me', authenticate, updateUserSchema, updateUser);

router.get('/verify/:token', verifyUserEmail);

router.get('/:userId', getUserById);

export default router;
