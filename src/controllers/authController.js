import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';

import { Session } from '../models/session.js';
import { isValidObjectId } from 'mongoose';

export const registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (await User.findOne({ email })) {
    return next(createHttpError(409, 'Email in use'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    ...req.body,
    password: hashedPassword,
  });

  const session = await createSession(user._id);

  setSessionCookies(res, session);

  res.status(201).json(user);
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  await Session.deleteOne({ userId: user._id });

  const session = await createSession(user._id);

  setSessionCookies(res, session);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  const isValid = sessionId && isValidObjectId(sessionId);

  if (isValid) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshSession = async (req, res) => {
  const { refreshToken } = req.cookies;

  console.log(req.cookies);
  const session = await Session.findOne({
    refreshToken: refreshToken,
  });

  console.log(session);

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({
    refreshToken: req.cookies.refreshToken,
  });

  const newSession = await createSession(session.userId);

  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed!',
  });
};
