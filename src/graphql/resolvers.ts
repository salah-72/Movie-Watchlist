import { Context } from './context';

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
  },

  Mutation: {
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
