import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, SOCKET_URL} from '../api/client';
import {movies as fallbackMovies, Movie} from '../data/movies';
import {genres as fallbackGenres, Genre} from '../data/genres';
import {promotions as fallbackPromotions, Promotion} from '../data/promotions';

// Phase B: central fetch wrapper with AsyncStorage stale-while-revalidate cache.

export const CACHE_KEYS = {
  MOVIES: 'cache:movies',
  GENRES: 'cache:genres',
  PROMOS: 'cache:promos',
  SHOWTIMES: (movieId: string) => `cache:showtimes:${movieId}`,
  USER: (userId: string) => `cache:user:${userId}`,
};

export interface SeatState {
  row: number;
  col: number;
  label: string;
  type: 'standard' | 'premium' | 'aisle';
  tags: string[];
  status: 'available' | 'held' | 'booked';
  bookedBy: string | null;
  swappable: boolean;
}

export interface Showtime {
  _id: string;
  movie: Movie | string;
  theater: string;
  screenId: string;
  startTime: string;
  price: {standard: number; premium: number};
  seats: SeatState[];
}

export interface ApiBooking {
  _id: string;
  movie: any;
  showtime: any;
  seats: {row: number; col: number; label: string}[];
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  paymentMode?: string;
  createdAt: string;
}

export function normalizeMovie(doc: any): Movie {
  return {
    id: doc._id || doc.id,
    name: doc.name || 'Unknown Movie',
    poster: doc.poster || 'https://picsum.photos/seed/movie/300/450',
    rating: typeof doc.rating === 'number' ? doc.rating : 4.0,
    genre: Array.isArray(doc.genre) ? doc.genre : [],
    synopsis: doc.synopsis || '',
    releaseDate: doc.releaseDate || '',
    language: doc.language || 'English',
    duration: doc.duration || '2h 00m',
    director: doc.director || 'Unknown',
    cast: Array.isArray(doc.cast) ? doc.cast : [],
    availability: doc.availability || 'Now Showing',
    showtimes: Array.isArray(doc.showtimes) ? doc.showtimes : [],
    price: typeof doc.price === 'number' ? doc.price : 250,
  };
}

export function formatShowtime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]}, ${hours}:${minutes} ${ampm}`;
}

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('userToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {...options, headers});
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch (e) {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

async function getCached<T>(cacheKey: string, fetcher: () => Promise<T>, ttlMs = 60 * 1000): Promise<T> {
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed.ts < ttlMs) {
        return parsed.data;
      }
    } catch (e) {
      // stale/corrupt cache, ignore
    }
  }
  const data = await fetcher();
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ts: Date.now(), data}));
  } catch (e) {
    console.warn('Cache write failed', e);
  }
  return data;
}

export async function fetchMovies(): Promise<Movie[]> {
  try {
    const docs = await getCached<Movie[]>(CACHE_KEYS.MOVIES, async () => request('/movies'), 5 * 60 * 1000);
    return docs.map(d => normalizeMovie(d));
  } catch (err) {
    console.warn('Movies API unavailable, using local catalog.', err);
    return fallbackMovies;
  }
}

export async function fetchGenres(): Promise<Genre[]> {
  try {
    return await getCached<Genre[]>(CACHE_KEYS.GENRES, async () => request('/genres'), 5 * 60 * 1000);
  } catch (err) {
    console.warn('Genres API unavailable, using local genres.', err);
    return fallbackGenres;
  }
}

export async function fetchPromotions(): Promise<Promotion[]> {
  try {
    return await getCached<Promotion[]>(CACHE_KEYS.PROMOS, async () => request('/promotions'), 5 * 60 * 1000);
  } catch (err) {
    console.warn('Promotions API unavailable, using local promos.', err);
    return fallbackPromotions;
  }
}

export async function fetchShowtimes(movieId?: string): Promise<Showtime[]> {
  const query = movieId ? `?movie=${movieId}` : '';
  return request<Showtime[]>(`/showtimes${query}`);
}

export async function fetchShowtime(showtimeId: string): Promise<Showtime> {
  return request<Showtime>(`/showtimes/${showtimeId}`);
}

export async function fetchTheater(theaterId: string): Promise<any> {
  return request(`/theaters/${theaterId}`);
}

export async function apiLogin(email: string, password: string) {
  return request<{token: string; user: any}>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });
}

export async function apiRegister(data: Record<string, string>) {
  return request<{token: string; user: any}>(`/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchUserProfile(userId: string) {
  return getCached<any>(CACHE_KEYS.USER(userId), async () => request(`/users/${userId}`), 60 * 1000);
}

export async function updateUserProfile(userId: string, data: any) {
  return request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchBookings(): Promise<ApiBooking[]> {
  return request(`/bookings`);
}

export async function createBooking(payload: {
  showtimeId: string;
  seatLabels: string[];
  paymentMode: string;
}): Promise<ApiBooking> {
  return request(`/bookings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelBookingApi(bookingId: string): Promise<ApiBooking> {
  return request(`/bookings/${bookingId}/cancel`, {method: 'PUT'});
}

export async function offerSeatSwap(showtimeId: string, seatLabel: string) {
  return request(`/swaps/offer`, {
    method: 'POST',
    body: JSON.stringify({showtimeId, seatLabel}),
  });
}

export async function unofferSeatSwap(showtimeId: string, seatLabel: string) {
  return request(`/swaps/unoffer`, {
    method: 'POST',
    body: JSON.stringify({showtimeId, seatLabel}),
  });
}

export async function requestSeatSwap(showtimeId: string, mySeat: string, theirSeat: string) {
  return request(`/swaps/request`, {
    method: 'POST',
    body: JSON.stringify({showtimeId, mySeat, theirSeat}),
  });
}

export async function toggleSeatSwap(showtimeId: string, seatLabel: string) {
  return request(`/swaps/toggle`, {
    method: 'POST',
    body: JSON.stringify({showtimeId, seatLabel}),
  });
}

export async function initiateSeatSwap(showtimeId: string, mySeat: string, theirSeat: string) {
  return request(`/swaps/initiate`, {
    method: 'POST',
    body: JSON.stringify({showtimeId, mySeat, theirSeat}),
  });
}

export async function acceptSeatSwap(swapRequestId: string) {
  return request(`/swaps/accept`, {
    method: 'POST',
    body: JSON.stringify({swapRequestId}),
  });
}

export async function rejectSeatSwap(swapRequestId: string) {
  return request(`/swaps/reject`, {
    method: 'POST',
    body: JSON.stringify({swapRequestId}),
  });
}

export {API_BASE_URL, SOCKET_URL};