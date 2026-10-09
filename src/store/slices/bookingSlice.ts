import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BookingItem} from '../../context/BookingContext';

export interface CartItem {
  movieId?: string;
  showtimeId: string | null;
  selectedLabels: string[];
  paymentMode: string;
}

interface BookingState {
  bookings: BookingItem[];
  activeCount: number;
  cart: CartItem | null;
}

const initialState: BookingState = {
  bookings: [],
  activeCount: 0,
  cart: null,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<BookingItem>) => {
      console.log('📌 [Redux bookingSlice] addBooking:', action.payload.movie.name, action.payload.seats);
      state.bookings.unshift(action.payload);
      state.activeCount = state.bookings.filter(b => b.status === 'confirmed').length;
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      console.log('📌 [Redux bookingSlice] cancelBooking ID:', action.payload);
      const booking = state.bookings.find(b => b.id === action.payload);
      if (booking) {
        booking.status = 'cancelled';
      }
      state.activeCount = state.bookings.filter(b => b.status === 'confirmed').length;
    },
    setBookings: (state, action: PayloadAction<BookingItem[]>) => {
      console.log('📌 [Redux bookingSlice] setBookings count:', action.payload.length);
      state.bookings = action.payload;
      state.activeCount = state.bookings.filter(b => b.status === 'confirmed').length;
    },
    updateCart: (state, action: PayloadAction<CartItem | null>) => {
      console.log('📌 [Redux bookingSlice] updateCart:', action.payload);
      state.cart = action.payload;
    },
  },
});

export const {addBooking, cancelBooking, setBookings, updateCart} = bookingSlice.actions;
export default bookingSlice.reducer;
