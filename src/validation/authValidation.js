import { Joi, Segments, celebrate } from 'celebrate';

export const registerSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().min(3).max(32).required(),
    email: Joi.string().email().max(64).required(),
    password: Joi.string().min(8).max(128).required(),
  }),
});

export const loginSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});
