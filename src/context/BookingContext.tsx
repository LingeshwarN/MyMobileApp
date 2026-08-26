import React, {createContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Movie} from '../data/movies';

export interface BookingItem {
  id: string;
  movie: Movie;
  showtime: string;
  seats: string[];
  quantity: number;
  subtotal: number;
  convenienceFee: number;
  total: number;
  paymentMode: string;
  status: 'confirmed' | 'cancelled';
  bookedAt: string;
}

interface BookingContextType {
  bookings: BookingItem[];
  addBooking: (item: BookingItem) => void;
  cancelBooking: (id: string) => void;
  clearBookings: () => void;
}

export const BookingContext = createContext<BookingContextType>({
  bookings: [],
  addBooking: () => {},
  cancelBooking: () => {},
  clearBookings: () => {},
});

export const BookingProvider = ({children}: {children: ReactNode}) => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const stored = await AsyncStorage.getItem('userBookings');
        if (stored) {
          setBookings(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load bookings:', e);
      }
    };
    loadBookings();
  }, []);

  const saveBookings = async (newBookings: BookingItem[]) => {
    setBookings(newBookings);
    await AsyncStorage.setItem('userBookings', JSON.stringify(newBookings));
  };

  const addBooking = (item: BookingItem) => {
    const updated = [item, ...bookings];
    saveBookings(updated);
  };

  const cancelBooking = (id: string) => {
    const updated = bookings.map(b =>
      b.id === id ? {...b, status: 'cancelled' as const} : b,
    );
    saveBookings(updated);
  };

  const clearBookings = () => {
    saveBookings([]);
  };

  return (
    <BookingContext.Provider
      value={{bookings, addBooking, cancelBooking, clearBookings}}>
      {children}
    </BookingContext.Provider>
  );
};
