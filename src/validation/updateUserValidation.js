import { Joi, Segments, celebrate } from 'celebrate';

export const updateUserSchema = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(3).max(32),
      email: Joi.string().email().max(64),
    })
    .min(1),
});
