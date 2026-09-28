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
