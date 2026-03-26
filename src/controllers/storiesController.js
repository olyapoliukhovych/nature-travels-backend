import createHttpError from 'http-errors';
import { Story } from '../models/story.js';

export const getStories = async (req, res) => {
  const stories = await Story.find();
  res.status(200).json(stories);
};

export const getStoryById = async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);

  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(story);
};
