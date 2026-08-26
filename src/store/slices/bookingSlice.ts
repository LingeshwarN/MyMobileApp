import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BookingItem} from '../../context/BookingContext';

interface BookingState {
  bookings: BookingItem[];
  activeCount: number;
}

const initialState: BookingState = {
  bookings: [],
  activeCount: 0,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<BookingItem>) => {
      state.bookings.unshift(action.payload);
      state.activeCount = state.bookings.filter(b => b.status === 'confirmed').length;
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      const booking = state.bookings.find(b => b.id === action.payload);
      if (booking) {
        booking.status = 'cancelled';
      }
      state.activeCount = state.bookings.filter(b => b.status === 'confirmed').length;
    },
    setBookings: (state, action: PayloadAction<BookingItem[]>) => {
      state.bookings = action.payload;
      state.activeCount = state.bookings.filter(b => b.status === 'confirmed').length;
    },
  },
});

export const {addBooking, cancelBooking, setBookings} = bookingSlice.actions;
export default bookingSlice.reducer;
