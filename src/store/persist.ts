import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Store} from '@reduxjs/toolkit';
import type {RootState} from './store';

// Phase D: lightweight Redux ↔ AsyncStorage persistence.
// No extra dependencies — just reads on startup, writes on every relevant change.

const BOOKINGS_KEY = 'cinebooks:redux:bookings';
const WISHLIST_KEY = 'cinebooks:redux:wishlist';

export async function loadPersistedState(): Promise<{
  booking?: Partial<RootState['booking']>;
  wishlist?: Partial<RootState['wishlist']>;
}> {
  try {
    const [b, w] = await Promise.all([
      AsyncStorage.getItem(BOOKINGS_KEY),
      AsyncStorage.getItem(WISHLIST_KEY),
    ]);
    const booking = b ? {bookings: JSON.parse(b).bookings ?? []} : undefined;
    const wishlist = w ? {items: JSON.parse(w).items ?? []} : undefined;
    return {booking, wishlist};
  } catch (e) {
    console.warn('Failed to load persisted Redux state:', e);
    return {};
  }
}

export function startPersisting(store: Store<RootState>) {
  store.subscribe(() => {
    try {
      const {booking, wishlist} = store.getState();
      AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(booking));
      AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Redux persist write failed', e);
    }
  });
}