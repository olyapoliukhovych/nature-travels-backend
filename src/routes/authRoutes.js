import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshUserSession,
} from '../controllers/authController.js';
import { registerSchema, loginSchema } from '../validation/auth.js';

const authRouter = Router();

authRouter.post('/register', registerSchema, registerUser);
authRouter.post('/login', loginSchema, loginUser);
authRouter.post('/refresh', refreshUserSession);

export default authRouter;
