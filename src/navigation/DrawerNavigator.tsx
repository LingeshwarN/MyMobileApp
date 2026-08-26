import React, {useContext} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainTabs from './MainTabs';
import OrdersScreen from '../screens/OrdersScreen';
import WishlistScreen from '../screens/WishlistScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';
import {UserContext} from '../context/UserContext';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const {user, logout} = useContext(UserContext);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userProfile');
          logout();
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={{uri: user?.avatar || 'https://picsum.photos/seed/lingesh/200/200'}}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'Lingesh'}</Text>
        <Text style={styles.email}>{user?.email || 'lingesh@cinebooks.com'}</Text>
      </View>

      <View style={styles.itemList}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label="Logout"
          labelStyle={styles.logoutLabel}
          icon={({color, size}) => (
            <Icon name="log-out-outline" size={size} color={Colors.error} />
          )}
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Colors.backgroundCard,
          width: 280,
        },
        drawerActiveTintColor: Colors.accent,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerLabelStyle: {
          ...Typography.body,
          fontWeight: '600',
        },
      }}>
      <Drawer.Screen
        name="MainDashboard"
        component={MainTabs}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({color, size}) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerHistory"
        component={OrdersScreen}
        options={{
          drawerLabel: 'Booking History',
          drawerIcon: ({color, size}) => (
            <Icon name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerWishlist"
        component={WishlistScreen}
        options={{
          drawerLabel: 'Wishlist',
          drawerIcon: ({color, size}) => (
            <Icon name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerPreferences"
        component={PreferencesScreen}
        options={{
          drawerLabel: 'Saved Preferences',
          drawerIcon: ({color, size}) => (
            <Icon name="options-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerSettings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({color, size}) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerHelp"
        component={HelpScreen}
        options={{
          drawerLabel: 'Help & Support',
          drawerIcon: ({color, size}) => (
            <Icon name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerFeedback"
        component={FeedbackScreen}
        options={{
          drawerLabel: 'Feedback',
          drawerIcon: ({color, size}) => (
            <Icon name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  name: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  email: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemList: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  logoutLabel: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
  },
});

export default DrawerNavigator;
