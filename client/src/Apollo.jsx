
import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: 'http://localhost:5000',
});
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:5000',
  })
);

// Let queries and mutations use HTTP as normal, and subscriptions use WebSocket.
const splitLint = split(({ query }) => {
  const definition = getMainDefinition(query);
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'subscription'
  );
}, wsLink, httpLink);

const authLink = setContext(() => {
  const token = localStorage.getItem('jwtToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(splitLint),
  cache: new InMemoryCache()
});

function Provider({ children }) {
  return (
    <ApolloProvider client={client}>
        {children}
    </ApolloProvider>
  );
}

const cache = client.cache;

export {
  Provider as ApolloProvider,
  client as apolloClient,
  cache as apolloCache,
};
