import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { ApolloProvider } from './Apollo';
import { AuthProvider } from './context/auth';

ReactDOM.render(
  <ApolloProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ApolloProvider>,
  document.getElementById('root')
);
