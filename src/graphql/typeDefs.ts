export const typeDefs = `#graphql
    type Movie {
        id: ID!
        title: String!
        year: Int
        genre: String
        overview: String
    }


    type Query {
        movies: [Movie!]!
        movie(id: ID!): Movie
    }

    type Mutation {
        addMovie(title: String!, year: Int, genre: String): Movie!
    }
    `;
