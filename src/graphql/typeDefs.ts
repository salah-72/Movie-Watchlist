export const typeDefs = `#graphql
    type Movie {
        id: ID!
        title: String!
        year: Int
        genre: String
        overview: String
    }


    type Query {
        movies(search: String, genre: String): [Movie!]!
        movie(id: ID!): Movie
    }

    type Mutation {
        addMovie(title: String!, year: Int, genre: String, overview: String): Movie!
        deleteMovie(id: ID!): Movie!
        updateMovie(id: ID!, title: String, year: Int, genre: String, overview: String): Movie!
    }
    `;
