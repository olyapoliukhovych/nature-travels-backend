import { Router } from 'express';
import {
  deleteStory,
  getCurrentUser,
  getMyStories,
  getSavedStories,
  getUserById,
  saveStory,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/users/:userId', getUserById);

router.get('/users/me', authenticate, getCurrentUser);
router.post('/users/me/saved/:storyId', authenticate, saveStory);
router.delete('/users/me/saved/:storyId', authenticate, deleteStory);
router.get('/users/me/stories', authenticate, getMyStories);
router.get('/users/me/saved', authenticate, getSavedStories);

export default router;
