import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  updateUserAvatar,
  updateUser,
  verifyUserEmail,
} from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';
import { updateUserSchema } from '../validation/updateUserValidation.js';

const router = Router();

router.patch(
  '/users/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

router.patch('/users/me', authenticate, updateUserSchema, updateUser);

router.get('/users/verify/:token', verifyUserEmail);

export default router;
