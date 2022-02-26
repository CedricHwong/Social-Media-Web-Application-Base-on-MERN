const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');
const { useServer } = require('graphql-ws/lib/use/ws');
// const ws = require('ws');
const { WebSocketServer } = require('ws');
const { buildSchema } = require('graphql');
const express = require('express');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');

let wsServer = null;

const schema = buildSchema(typeDefs, {
    resolvers
});

const pubsub = new PubSub();

const server = new ApolloServer({
    // typeDefs,
    schema,
    // resolvers,
    context: ({ req }) => ({ req, pubsub }),
    // context: ({ req }) => ({ req }),
    plugins: [{
        async serverWillStart() {
            return {
                async drainServer() {
                    wsServer.close();
                }
            };
        }
    }],
});
const app = express();
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "localhost"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

mongoose
    .connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log('MongoDB Connected');
        // return server.listen({ port: 3000 });
        return server.start();
    })
    .then(() => {
        server.applyMiddleware({ app, path: '/', cors: true });
        return app.listen(3000);
    })
    .then((expressServer) => {
        console.log(`Server runing at port 3000`);
        wsServer = new WebSocketServer({
            server: expressServer,
            path: '/',
        });
        useServer({ schema }, wsServer);
    })
    // .then(res => {
    //     console.log(`Server running at ${res.url}`);
    //     // const wsServer = new ws.Server({server, path: '/graphql'});
    //     // useServer({schema, resolvers}, wsServer);
    // })
    .catch(err => {
        console.error(err);
    });
