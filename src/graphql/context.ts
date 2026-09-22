import { prisma } from '@/config/postgres';
import type { IncomingMessage } from 'http';
import { getUserId } from './auth';

export interface Context {
  prisma: typeof prisma;
  userId: string | null;
}

export const createContext = async ({
  req,
}: {
  req: IncomingMessage;
}): Promise<Context> => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  return { prisma, userId: token ? getUserId(token) : null };
};
