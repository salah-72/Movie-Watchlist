import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { Context, createContext } from './graphql/context';
import { testPostgresConnection } from './config/postgres';

async function main() {
  try {
    await testPostgresConnection();
    const server = new ApolloServer<Context>({ typeDefs, resolvers });

    const { url } = await startStandaloneServer(server, {
      context: createContext,
      listen: { port: 4000 },
    });

    console.log(`Server ready at ${url}`);
  } catch (err) {
    console.error('Failed to startup:');
    process.exit(1);
  }
}

main();
