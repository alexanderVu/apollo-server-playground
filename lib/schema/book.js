const { gql } = require('apollo-server')

/*
 * Construct a schema, using GraphQL schema language
 */
const typeDefs = gql`
  scalar Date

  """
  Account gives user access to the system.
  """
  type Book {
    id: ID!
    title: String!
    author: String
    isbn: String!
    language: String
    price: Float
  }

  input BookInput {
    title: String!
    author: String
    isbn: String!
    language: String
    price: Float
  }

  input BookUpdateInput {
    id: ID!
    title: String!
    author: String
    isbn: String!
    language: String
    price: Float
  }

  extend type Subscription {
    newBook: Book
  }

  extend type Query {
    getBookByISBN(isbn: String!): [Book],
    getBooks: [Book],
  }

  extend type Mutation {
    addBook(input: BookInput!): Book,
    updateBook(id: ID!, input: BookUpdateInput!): Book,
    removeBook(id: ID!): Book,
  }
`
/*
 * Provide resolver functions for your schema fields
 */
const NEW_BOOK = "NEW_BOOK"

const resolvers = {
  Subscription: {
    newBook: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_BOOK)
    }
  },
  Query: {
    getBookByISBN: (_, { isbn }, { dataSources }) => dataSources.book.getByISBN(isbn),
    getBooks: (_, __, { dataSources }) => dataSources.book.getAll()
  },
  Mutation: {
    addBook: (_, { input }, { dataSources, pubsub }) => {
      const newBook = dataSources.book.save(input)
      pubsub.publish(NEW_BOOK, { newBook })
      return newBook;
    },
    updateBook: (_, { id, input }, { dataSources }) => dataSources.book.modify(id, input),
    removeBook: (_, { id }, { dataSources }) => dataSources.book.modify(id)
  }
}

module.exports = { typeDefs, resolvers }
