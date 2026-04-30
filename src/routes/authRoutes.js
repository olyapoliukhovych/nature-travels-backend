import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  // requestResetEmail,
  // resetPassword,
} from '../controllers/authController.js';
import {
  registerSchema,
  loginSchema,
  // requestResetEmailSchema,
  // resetPasswordSchema,
} from '../validation/authValidation.js';

const authRouter = Router();

authRouter.post('/register', celebrate(registerSchema), registerUser);
authRouter.post('/login', celebrate(loginSchema), loginUser);
authRouter.get('/refresh', refreshSession);
authRouter.post('/logout', logoutUser);
// authRouter.post(
//   '/auth/request-reset-email',
//   celebrate(requestResetEmailSchema),
//   requestResetEmail,
// );
// authRouter.post(
//   '/auth/reset-password',
//   celebrate(resetPasswordSchema),
//   resetPassword,
// );

export default authRouter;
