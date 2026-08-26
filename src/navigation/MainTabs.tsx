import React from 'react';
import {View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {Colors, Typography, Shadow} from '../theme';
import HomeStack from './HomeStack';
import MovieExplorerScreen from '../screens/MovieExplorerScreen';
import BookingsScreen from '../screens/BookingsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileStack from './ProfileStack';
import Badge from '../components/Badge';
import {RootState} from '../store/store';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const bookings = useSelector((state: RootState) => state.booking.bookings);
  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.backgroundCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
          ...Shadow.lg,
        },
        tabBarLabelStyle: {
          ...Typography.small,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GenresTab"
        component={MovieExplorerScreen}
        options={{
          tabBarLabel: 'Genres',
          tabBarIcon: ({color, size}) => (
            <Icon name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({color, size}) => (
            <View style={styles.iconContainer}>
              <Icon name="ticket" size={size} color={color} />
              <Badge count={activeBookingsCount} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({color, size}) => (
            <Icon name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainTabs;
