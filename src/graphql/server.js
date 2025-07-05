const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const middleware = require('../middlewares/index')
const Board = require('../models/board')

const typeDefs = `
  type Board {
    id: ID!
    name: String!
  }

  type Query {
    boards: [Board!]!
    board(id: ID!): Board
  }
`;

const resolvers = {
  Query: {
    boards: async (parent, args, context) => {
      return Board.find({ owner: context.user.id });
    },
    board: async (parent, args, context) => {
      return Board.findOne({ _id: args.id, owner: context.user.id });
    }
  }
};

async function setupGraphQL(app) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(
    '/graphql',
    middleware.tokenExtractor,
    middleware.userExtractor,
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: req.user,
      }),
    })
  );
}

module.exports = setupGraphQL;
