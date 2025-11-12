// ---------------------------------------------------------
// useSocket.ts — custom React hook for socket event handling
// ---------------------------------------------------------

import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../api/socket';
import { Alert } from 'react-native';

export const useSocket = (
  eventHandlers: Record<string, (data: any) => void> = {},
) => {
  const socketRef = useRef(connectSocket());

  useEffect(() => {
    const socket = socketRef.current;

    // 🔹 Attach all event listeners dynamically
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // 🔹 Cleanup listeners on unmount
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      disconnectSocket();
    };
  }, []);

  // 🔹 Safe emit wrapper
  const emit = (
    event: string,
    payload?: any,
    callback?: (res: any) => void,
  ) => {
    const socket = socketRef.current;
    if (!socket.connected) {
      Alert.alert('Connection Lost', 'Reconnecting to the server...');
      socket.connect();
    }
    socket.emit(event, payload, callback);
  };

  return { socket: socketRef.current, emit };
};
