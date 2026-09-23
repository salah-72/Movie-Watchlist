import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';

import env from '@/config/env';
import { Context } from './context';

const JWT_SECRET = env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const signToken = (userId: string) => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};

export const getUserId = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return typeof payload === 'object' && typeof payload.userId === 'string'
      ? payload.userId
      : null;
  } catch {
    return null;
  }
};

export const requireAuth = (ctx: Context): string => {
  if (!ctx.userId) {
    throw new GraphQLError('You must be logged in', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return ctx.userId;
};
