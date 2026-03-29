import { Joi, segments, celebrate } from 'celebrate';

export const registerSchema = celebrate({
  [segments.BODY]: Joi.object().keys({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const loginSchema = celebrate({
  [segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});
