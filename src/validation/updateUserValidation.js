import { Joi, Segments, celebrate } from 'celebrate';
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const paginationParams = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(50).default(10),
});

export const updateUserSchema = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(3).max(32),
      email: Joi.string().email().max(64),
    })
    .min(1),
});

export const verifyTokenSchema = {
  [Segments.PARAMS]: Joi.object({
    token: Joi.string().required().messages({
      'string.base': 'Token must be a string',
      'any.required': 'Token is required',
    }),
  }),
};

export const userParamSchema = {
  [Segments.PARAMS]: Joi.object({
    userId: Joi.string().custom(objectIdValidator).required().messages({
      'string.base': 'User id must be a string',
      'any.required': 'User id is required',
      'any.invalid': 'User id must be a valid ObjectId',
    }),
  }),
  [Segments.QUERY]: paginationParams,
};

export const getUsersQuerySchema = {
  [Segments.QUERY]: paginationParams,
};
