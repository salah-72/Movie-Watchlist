import { prisma } from '@/config/postgres';
import type { IncomingMessage } from 'http';
import { getUserId } from './auth';
import { createLoaders } from './loaders';

export interface Context {
  prisma: typeof prisma;
  userId: string | null;
  loaders: ReturnType<typeof createLoaders>;
}

export const createContext = async ({
  req,
}: {
  req: IncomingMessage;
}): Promise<Context> => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  return {
    prisma,
    userId: token ? getUserId(token) : null,
    loaders: createLoaders(prisma),
  };
};
