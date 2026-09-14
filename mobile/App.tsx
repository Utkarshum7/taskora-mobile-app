/**
 * Modulus17 To-Do — app root.
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/app/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthBootstrap } from './src/features/auth/AuthBootstrap';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AuthBootstrap>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthBootstrap>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
