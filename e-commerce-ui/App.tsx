import { Provider } from 'react-redux';
import React, { useEffect } from 'react';
import { components } from './src/components';
import { persistor, store } from './src/store';
import { enableScreens } from 'react-native-screens';
import Orientation from 'react-native-orientation-locker';
import { PersistGate } from 'redux-persist/integration/react';
import StackNavigator from './src/navigation/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, ApolloLink, Observable } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from './src/API/Enviroment';
enableScreens();

const App = () => {
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const httpLink = new HttpLink({ uri: API_URL });

  const authMiddleware = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      (async () => {
        const token = await AsyncStorage.getItem("token");
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : "",
          },
        });
        const subscriber = {
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        };
        forward(operation).subscribe(subscriber);
      })();
    });
  });

  const client = new ApolloClient({
    link: ApolloLink.from([authMiddleware, httpLink]),
    cache: new InMemoryCache(),
  });

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
