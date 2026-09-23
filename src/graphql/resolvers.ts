import { GraphQLError } from 'graphql';
import { hashPassword, requireAuth, signToken, verifyPassword } from './auth';
import { Context } from './context';

const badInput = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

interface authArgs {
  email: string;
  password: string;
}
interface movieArgs {
  id: string;
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

    movie: async (_: unknown, { id }: movieArgs, ctx: Context) => {
      return ctx.prisma.movie.findUnique({ where: { id } });
    },

    me: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.user.findUnique({ where: { id: userId } });
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
      { prisma }: Context,
    ) => {
      return prisma.movie.create({ data: { title, genre, year, overview } });
    },

    deleteMovie: async (_: unknown, { id }: movieArgs, { prisma }: Context) => {
      return prisma.movie.delete({ where: { id } });
    },

    updateMovie: async (
      _: unknown,
      { id, title, year, genre, overview }: updateMovieArgs,
      { prisma }: Context,
    ) => {
      return prisma.movie.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(year !== undefined && { year }),
          ...(genre !== undefined && { genre }),
          ...(overview !== undefined && { overview }),
        },
      });
    },
  },
};
