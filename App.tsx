import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './src/store/store';
import {UserProvider} from './src/context/UserContext';
import {BookingProvider} from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';
import {Colors} from './src/theme';

function App() {
  return (
    <ReduxProvider store={store}>
      <UserProvider>
        <BookingProvider>
          <SafeAreaProvider>
            <StatusBar barStyle="light-content" />
            <AppNavigator />
          </SafeAreaProvider>
        </BookingProvider>
      </UserProvider>
    </ReduxProvider>
  );
}

export default App;
