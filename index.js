
const http = require('http');

const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PubSub } = require('graphql-subscriptions');

const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const path = require('path');

const pubsub = new PubSub();
const PORT = process.env.PORT || 5000;

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = http.createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({ server: httpServer, });

// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({
  schema,
  // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/server.ServerOptions.md#context
  context: (subServerCtx, subMsg, ExeArgs) => ({ subServerCtx, subMsg, ExeArgs, pubsub }),
}, wsServer);

const apolloServer = new ApolloServer({
  schema,
  context: ({ req, res }) => ({ req, res, pubsub }),
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server when the apollo server itself closes.
    {
      serverWillStart: async () => ({
        drainServer: async () => {
          console.log('Closing WebSocket server ...');
          await serverCleanup.dispose();
        },
      }),
    },
  ],
});

app.use(express.static(path.join(__dirname, 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
    console.log('MongoDB Connected');

    console.log('Starting GraphQL server (based on Apollo)...');
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/', cors: true, });

    // the server starts listening on the HTTP and WebSocket transports simultaneously.
    await new Promise(res => httpServer.listen(PORT, res));
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`);
  }
  catch (err) {
    console.error(err);
  }
})();
