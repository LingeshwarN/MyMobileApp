import {useEffect, useRef} from 'react';
import {io, Socket} from 'socket.io-client';
import {SOCKET_URL} from '../services/api';

// Real-time seat-swap listener for the current showtime and current user.
// Joins the showtime room (and leaves the previous one) whenever it changes,
// and joins the user room so swap requests can be delivered directly to the
// device. All events are forwarded to the onEvent callback.
export function useSocket(
  showtimeId: string | null,
  onEvent?: (payload: any) => void,
  userId?: string | null,
) {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    let socket: Socket | null = null;
    let disposed = false;

    try {
      socket = io(`${SOCKET_URL}/seat-swap`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 5000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        if (showtimeId) socket?.emit('join-showtime', showtimeId);
        if (userId) socket?.emit('join-user', userId);
      });

      socket.on('seat-swapped', payload => {
        if (!disposed) callbackRef.current?.(payload);
      });

      socket.on('swap_received', payload => {
        if (!disposed) callbackRef.current?.(payload);
      });
    } catch (e) {
      console.warn('Socket.io unavailable, swap alerts disabled.', e);
    }

    return () => {
      disposed = true;
      try {
        socket?.disconnect();
      } catch (e) {
        // ignore
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reactively join/leave rooms when the selected showtime changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (showtimeId) {
      socket.emit('join-showtime', showtimeId);
    }
    if (userId) {
      socket.emit('join-user', userId);
    }
    const prev = (socket as any).__prevShowtime;
    if (prev && prev !== showtimeId) {
      socket.emit('leave-showtime', prev);
    }
    (socket as any).__prevShowtime = showtimeId;
  }, [showtimeId, userId]);

  return socketRef;
}