import { GraphQLError } from 'graphql';

export const encodeCursor = (id: string) =>
  Buffer.from(id).toString('base64url');

export const decodeCursor = (cursor: string): string => {
  const id = Buffer.from(cursor, 'base64url').toString('utf8');
  if (!id) {
    throw new GraphQLError('Invalid cursor', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return id;
};

export async function paginate<T extends { id: string }>(
  first: number,
  after: string | null | undefined,
  fetchPage: (page: {
    take: number;
    skip?: number;
    cursor?: { id: string };
  }) => Promise<T[]>,
) {
  if (first < 1 || first > 50) {
    throw new GraphQLError('first must be between 1 and 50', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const rows = await fetchPage({
    take: first + 1,
    ...(after && { cursor: { id: decodeCursor(after) }, skip: 1 }),
  });

  const hasNextPage = rows.length > first;
  const nodes = hasNextPage ? rows.slice(0, first) : rows;

  return {
    edges: nodes.map((node) => ({ cursor: encodeCursor(node.id), node })),
    pageInfo: {
      hasNextPage,
      endCursor: nodes.length ? encodeCursor(nodes[nodes.length - 1].id) : null,
    },
  };
}
