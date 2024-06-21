import {Provider} from 'react-redux';
import React, {useEffect} from 'react';
import {components} from './src/components';
import {persistor, store} from './src/store';
import {enableScreens} from 'react-native-screens';
import Orientation from 'react-native-orientation-locker';
import {PersistGate} from 'redux-persist/integration/react';
import StackNavigator from './src/navigation/StackNavigator';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import {API_URL} from './src/Api/Enviroment';

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
