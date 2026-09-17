import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './src/store/store';
import {startPersisting, loadPersistedState} from './src/store/persist';
import {UserProvider} from './src/context/UserContext';
import {BookingProvider} from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';
import {Colors} from './src/theme';
import {setBookings} from './src/store/slices/bookingSlice';
import {setWishlist} from './src/store/slices/wishlistSlice';

startPersisting(store);

function App() {
  useEffect(() => {
    loadPersistedState().then(({booking, wishlist}) => {
      if (booking?.bookings) store.dispatch(setBookings(booking.bookings));
      if (wishlist?.items) store.dispatch(setWishlist(wishlist.items));
    });
  }, []);

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