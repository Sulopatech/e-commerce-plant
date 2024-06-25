import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from '@apollo/client';
import React from 'react';

// Apollo Client setup
const httpLink = new HttpLink({
  uri: 'http://192.168.1.55:3000/shop-api', // Replace with your GraphQL endpoint
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Wrapping the App component with ApolloProvider
const AppWithApollo = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

AppRegistry.registerComponent(appName, () => AppWithApollo);

export default client;
