import type { PrismaClient, Movie } from '@/generated/prisma';
import DataLoader from 'dataloader';

export const createLoaders = (prisma: PrismaClient) => ({
  movieById: new DataLoader<string, Movie | null>(async (ids) => {
    const movies = await prisma.movie.findMany({
      where: { id: { in: [...ids] } },
    });

    const byId = new Map(movies.map((m) => [m.id, m]));
    return ids.map((id) => byId.get(id) ?? null);
  }),

  watchlistCountByMovieId: new DataLoader<string, number>(async (ids) => {
    const rows = await prisma.watchlistItem.groupBy({
      by: ['movieId'],
      where: { movieId: { in: [...ids] } },
      _count: { _all: true },
    });

    const counts = new Map(rows.map((r) => [r.movieId, r._count._all]));
    return ids.map((id) => counts.get(id) ?? 0);
  }),
});
