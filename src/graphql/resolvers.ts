import { Context } from './context';

interface movieArgs {
  id: string;
}

interface AddMovieArgs {
  title: string;
  year?: number;
  genre?: string;
}

interface updateMovieArgs {
  id: string;
  title?: string;
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

    deleteMovie: async (_: unknown, { id }: movieArgs, { prisma }: Context) => {
      return prisma.movie.delete({ where: { id } });
    },

    updateMovie: async (
      _: unknown,
      { id, title, year, genre }: updateMovieArgs,
      { prisma }: Context,
    ) => {
      return prisma.movie.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(year !== undefined && { year }),
          ...(genre !== undefined && { genre }),
        },
      });
    },
  },
};
