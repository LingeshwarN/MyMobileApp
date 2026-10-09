import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MovieExplorerScreen from '../screens/MovieExplorerScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import BookingsScreen from '../screens/BookingsScreen';

const Stack = createStackNavigator();

const GenresStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GenresMain" component={MovieExplorerScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Booking" component={BookingsScreen} />
    </Stack.Navigator>
  );
};

export default GenresStack;
