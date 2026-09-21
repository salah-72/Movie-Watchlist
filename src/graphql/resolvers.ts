import { Context } from './context';

interface movieArgs {
  id: string;
}

interface AddMovieArgs {
  title: string;
  year?: number;
  genre?: string;
}

export const resolvers = {
  Query: {
    movies: async (_: unknown, __: unknown, ctx: Context) => {
      return ctx.prisma.movie.findMany();
    },
    movie: async (_: unknown, { id }: movieArgs, ctx: Context) => {
      return ctx.prisma.movie.findUnique({ where: { id } });
    },
  },

  Mutation: {
    addMovie: async (
      _: unknown,
      { title, year, genre }: AddMovieArgs,
      { prisma }: Context,
    ) => {
      return prisma.movie.create({ data: { title, genre, year } });
    },
  },
};
