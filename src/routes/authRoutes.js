import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';

const authRouter = Router();

authRouter.post('/register', celebrate(registerSchema), registerUser);
authRouter.post('/login', celebrate(loginSchema), loginUser);
authRouter.post('/refresh', refreshUserSession);
authRouter.post('/logout', logoutUser);

export default authRouter;
