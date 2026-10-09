import {configureStore} from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import bookingReducer from './slices/bookingSlice';
import wishlistReducer from './slices/wishlistSlice';

const loggerMiddleware = (storeApi: any) => (next: any) => (action: any) => {
  console.log('⚡ [Redux Action]:', action.type, action.payload ?? '');
  const result = next(action);
  return result;
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    booking: bookingReducer,
    wishlist: wishlistReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
