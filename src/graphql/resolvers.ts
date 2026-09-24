import { GraphQLError } from 'graphql';
import { hashPassword, requireAuth, signToken, verifyPassword } from './auth';
import { Context } from './context';
import { Prisma, WatchStatus } from '@/generated/prisma';

const badInput = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

const getItem = async (ctx: Context, itemId: string) => {
  const userId = requireAuth(ctx);
  const item = await ctx.prisma.watchlistItem.findFirst({
    where: { id: itemId, userId },
  });
  if (!item) {
    throw new GraphQLError('Watchlist item not found', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return item;
};

interface authArgs {
  email: string;
  password: string;
}
interface movieArgs {
  movieId: string;
}

interface AddMovieArgs {
  title: string;
  year?: number;
  genre?: string;
  overview?: string;
}

interface updateMovieArgs {
  id: string;
  title?: string;
  year?: number;
  genre?: string;
  overview?: string;
}

export const resolvers = {
  Query: {
    movies: async (
      _: unknown,
      args: { search?: string | null; genre?: string | null },
      ctx: Context,
    ) => {
      return ctx.prisma.movie.findMany({
        where: {
          ...(args.search && {
            title: { contains: args.search, mode: 'insensitive' },
          }),
          ...(args.genre && { genre: args.genre }),
        },
      });
    },

    movie: async (_: unknown, { movieId }: movieArgs, ctx: Context) => {
      return ctx.prisma.movie.findUnique({ where: { id: movieId } });
    },

    me: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.user.findUnique({
        where: { id: userId },
      });
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { email, password }: authArgs,
      ctx: Context,
    ) => {
      if (password.length < 8)
        throw badInput('Password must be at least 8 characters');

      const normalized = email.trim().toLowerCase();
      const exist = await ctx.prisma.user.findUnique({
        where: { email: normalized },
      });
      if (exist) throw badInput('user already exist');

      const user = await ctx.prisma.user.create({
        data: { email: normalized, password: await hashPassword(password) },
      });

      return { token: signToken(user.id), user };
    },

    login: async (_: unknown, { email, password }: authArgs, ctx: Context) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!user || !(await verifyPassword(password, user.password))) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return { token: signToken(user.id), user };
    },

    addMovie: async (
      _: unknown,
      { title, year, genre, overview }: AddMovieArgs,
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return ctx.prisma.movie.create({
        data: { title, genre, year, overview },
      });
    },

    deleteMovie: async (_: unknown, { movieId }: movieArgs, ctx: Context) => {
      requireAuth(ctx);
      return ctx.prisma.movie.delete({ where: { id: movieId } });
    },

    updateMovie: async (
      _: unknown,
      { id, title, year, genre, overview }: updateMovieArgs,
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return ctx.prisma.movie.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(year !== undefined && { year }),
          ...(genre !== undefined && { genre }),
          ...(overview !== undefined && { overview }),
        },
      });
    },

    addToWatchlist: async (
      _: unknown,
      { movieId }: movieArgs,
      ctx: Context,
    ) => {
      const userId = requireAuth(ctx);
      try {
        return await ctx.prisma.watchlistItem.create({
          data: {
            userId,
            movieId,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw badInput('Movie already in your watchlist');
          if (e.code === 'P2003') throw badInput('Movie does not exist');
        }
        throw e;
      }
    },

    updateWatchStatus: async (
      _parent: unknown,
      { itemId, status }: { itemId: string; status: WatchStatus },
      ctx: Context,
    ) => {
      await getItem(ctx, itemId);
      return ctx.prisma.watchlistItem.update({
        where: { id: itemId },
        data: { status },
      });
    },

    rateMovie: async (
      _parent: unknown,
      { itemId, rating }: { itemId: string; rating: number },
      ctx: Context,
    ) => {
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        throw badInput('Rating must be an integer between 1 and 10');
      }
      await getItem(ctx, itemId);
      return ctx.prisma.watchlistItem.update({
        where: { id: itemId },
        data: { rating },
      });
    },

    removeFromWatchlist: async (
      _parent: unknown,
      { itemId }: { itemId: string },
      ctx: Context,
    ) => {
      await getItem(ctx, itemId);
      await ctx.prisma.watchlistItem.delete({ where: { id: itemId } });
      return true;
    },
  },

  User: {
    watchlist: (
      parent: { id: string },
      args: { status?: WatchStatus | null },
      ctx: Context,
    ) => {
      return ctx.prisma.watchlistItem.findMany({
        where: {
          userId: parent.id,
          ...(args.status && { status: args.status }),
        },
        orderBy: { addedAt: 'desc' },
      });
    },
  },

  WatchlistItem: {
    movie: (parent: { movieId: string }, _: unknown, ctx: Context) => {
      return ctx.prisma.movie.findUniqueOrThrow({
        where: { id: parent.movieId },
      });
    },
    addedAt: (parent: { addedAt: Date }) => parent.addedAt.toISOString(),
  },
};
