// ---------------------------------------------------------
// useSocket.ts — persistent socket hook (singleton pattern)
// ---------------------------------------------------------
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { connectSocket } from '../api/socket'; // ✅ single connect function

// Keep one socket instance for the whole app
let globalSocket: any = null;

export const useSocket = (
  eventHandlers: Record<string, (data: any) => void> = {},
) => {
  // Initialize global socket only once
  if (!globalSocket) {
    globalSocket = connectSocket();
  }

  const socketRef = useRef(globalSocket);

  useEffect(() => {
    const socket = socketRef.current;

    // ✅ Attach all event listeners dynamically
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // ✅ Cleanup only the event listeners — NOT the socket connection
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      // ❌ Don't call disconnectSocket() here — we keep socket alive globally
    };
  }, []);

  // ✅ Safe emit wrapper
  const emit = (
    event: string,
    payload?: any,
    callback?: (res: any) => void,
  ) => {
    const socket = socketRef.current;
    if (!socket.connected) {
      console.warn('[SOCKET] Disconnected — attempting reconnect...');
      try {
        socket.connect();
        Alert.alert('Reconnecting...', 'Reconnected to server');
      } catch (err) {
        console.error('[SOCKET] Reconnect failed:', err);
      }
    }
    socket.emit(event, payload, callback);
  };

  return { socket: socketRef.current, emit };
};
