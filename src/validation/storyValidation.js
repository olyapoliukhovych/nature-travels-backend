import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const getStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(20).default(10),
    categoryId: Joi.string()
      .custom(objectIdValidator)
      .messages({ 'string.pattern.base': 'Category must be a valid ObjectId' }),
  }),
};

export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    categoryId: Joi.string().custom(objectIdValidator).required().messages({
      'string.base': 'Category must be a string',
      'any.required': 'Category is required',
    }),
    title: Joi.string().trim().min(3).max(100).required().messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title should have at least {#limit} characters',
      'string.max': 'Title should not exceed {#limit} characters',
      'any.required': 'Title is required',
    }),
    article: Joi.string().trim().min(3).max(5000).required().messages({
      'string.base': 'Article must be a string',
      'string.min': 'Article should have at least {#limit} characters',
      'string.max': 'Article should not exceed {#limit} characters',
      'any.required': 'Article is required',
    }),
  }),
};

export const storyIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    storyId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const validationRecomendSchema = {
  [Segments.QUERY]: Joi.object({
    storyId: Joi.string().custom(objectIdValidator).required(),
    categoryId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const updateStorySchema = {
  [Segments.BODY]: Joi.object({
    categoryId: Joi.string().custom(objectIdValidator).messages({
      'string.base': 'Category must be a string',
    }),
    title: Joi.string().trim().min(3).max(100).messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title should have at least {#limit} characters',
      'string.max': 'Title should not exceed {#limit} characters',
    }),
    article: Joi.string().trim().min(3).max(5000).messages({
      'string.base': 'Article must be a string',
      'string.min': 'Article should have at least {#limit} characters',
      'string.max': 'Article should not exceed {#limit} characters',
    }),
  }).min(1),
};

export const paginationSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(20).default(10),
  }),
};
