import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  USER_TOKEN: 'userToken',
  USER_PROFILE: 'userProfile',
  USER_PREFERENCES: 'userPreferences',
  WISHLIST: 'userWishlist',
  BOOKINGS: 'userBookings',
  THEME: 'appTheme',
  RECENT_SEARCHES: 'recentSearches',
};

export const Storage = {
  save: async (key: string, value: any) => {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (e) {
      console.error(`Error saving key ${key}:`, e);
      return false;
    }
  },

  get: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (e) {
      console.error(`Error getting key ${key}:`, e);
      return null;
    }
  },

  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing key ${key}:`, e);
      return false;
    }
  },

  clearSession: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(KEYS.USER_PROFILE);
      await AsyncStorage.removeItem(KEYS.BOOKINGS);
      await AsyncStorage.removeItem(KEYS.WISHLIST);
      // Retain theme and non-sensitive preferences
      return true;
    } catch (e) {
      console.error('Error clearing session:', e);
      return false;
    }
  },
};

export default Storage;
