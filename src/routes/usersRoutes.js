import { Router } from 'express';
import { getUserById } from '../controllers/userController.js';

const router = Router();

router.get('/users/:userId', getUserById);

export default router;
