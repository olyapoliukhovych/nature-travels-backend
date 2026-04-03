import crypto from 'node:crypto';
import { Session } from '../models/session.js';
import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from '../constants/time.js';

export const createSession = async (userId) => {
  return await Session.create({
    userId,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_LIFETIME),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
  });
};

export const setSessionCookies = (res, session) => {
  const commonOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  res.cookie('accessToken', session.accessToken, {
    ...commonOptions,
    expires: session.accessTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    ...commonOptions,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    ...commonOptions,
    expires: session.refreshTokenValidUntil,
  });
};
