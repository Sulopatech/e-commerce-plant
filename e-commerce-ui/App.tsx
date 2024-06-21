import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { enableScreens } from 'react-native-screens';
import Orientation from 'react-native-orientation-locker';
import StackNavigator from './src/navigation/StackNavigator';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { store, persistor } from './src/store'; // Adjust path as per your project structure
import { components } from './src/components'; // Adjust path as per your project structure
import { ApolloProvider ,
        ApolloClient,
        HttpLink,
        InMemoryCache,
} from '@apollo/client';

import { API_URL } from "./src/Api/Environment";

enableScreens();

const App = () => {
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const httpLink = new HttpLink({
    uri: API_URL,
  });

  const client = new ApolloClient({
    link: httpLink,
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
