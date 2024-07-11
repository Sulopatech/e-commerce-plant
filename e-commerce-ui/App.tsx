import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { enableScreens } from 'react-native-screens';
import Orientation from 'react-native-orientation-locker';
import StackNavigator from './src/navigation/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store'; // Adjust path as per your project structure
import { components } from './src/components'; // Adjust path as per your project structure
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client';

import { API_URL } from './src/Api/Environment';
import localStorage from 'redux-persist/es/storage';
import * as Keychain from 'react-native-keychain';

// Enable React Native Screens
enableScreens();

const getAuthToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials.password; // This is your token
    }
    return null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};


// Create an HttpLink for sending GraphQL operations
const httpLink = new HttpLink({
  uri: API_URL,
});

// Create a custom Apollo Link to intercept responses and extract headers
const authLink = new ApolloLink((operation, forward) => {
  const token = getAuthToken();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return forward(operation).map(response => {
    const context = operation.getContext();
    const newToken = context.response.headers.get('Vendure-Auth-Token');
    if (newToken) {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: newToken ? `Bearer ${newToken}` : '',
        },
      }));
      Keychain.setGenericPassword('authToken', newToken).catch(error => {
        console.error('Keychain Error:', error);
      });
    }
    return response;
  });
});

// Combine the authLink with the httpLink
const link = ApolloLink.from([authLink, httpLink]);

// Initialize Apollo Client with the combined link
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const App = () => {
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        <Provider store={store}>
          <PersistGate loading={<components.Loader />} persistor={persistor}>
            <NavigationContainer>
              <StackNavigator />
            </NavigationContainer>
          </PersistGate>
          <components.AppState />
        </Provider>
        <components.FlashMessage />
      </ApolloProvider>
    </SafeAreaProvider>
  );
};

export default App;