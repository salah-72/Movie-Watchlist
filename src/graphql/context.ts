import { prisma } from '@/config/postgres';

export interface Context {
  prisma: typeof prisma;
}

export const createContext = async (): Promise<Context> => ({ prisma });
