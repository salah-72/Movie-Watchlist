export const typeDefs = `#graphql
    enum WatchStatus {
        WANT_TO_WATCH
        WATCHING
        WATCHED
    }

    type Movie {
        id: ID!
        title: String!
        year: Int
        genre: String
        overview: String
        watchlistCount: Int!
    }

    type WatchlistItem {
        id: ID!
        movie: Movie!
        status: WatchStatus!
        rating: Int
        notes: String
        addedAt: String!
    }


    type User {
        id: ID!
        email: String!
        watchlist(status: WatchStatus): [WatchlistItem!]!
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type MovieEdge {
        cursor: String!
        node: Movie!
    }

    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String
    }

    type MovieConnection {
        edges: [MovieEdge!]!
        pageInfo: PageInfo!
        totalCount: Int!
    }

    type Query {
        movies(search: String, genre: String, first: Int = 10, after: String): MovieConnection!
        movie(id: ID!): Movie
        me: User
    }

    type Mutation {
        register(email: String!, password: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!

        addMovie(title: String!, year: Int, genre: String, overview: String): Movie!
        deleteMovie(movieId: ID!): Movie!
        updateMovie(movieId: ID!, title: String, year: Int, genre: String, overview: String): Movie!

        addToWatchlist(movieId: ID!): WatchlistItem!
        updateWatchStatus(itemId: ID!, status: WatchStatus!): WatchlistItem!
        rateMovie(itemId: ID!, rating: Int!): WatchlistItem!
        removeFromWatchlist(itemId: ID!): Boolean!
    }
  `;
