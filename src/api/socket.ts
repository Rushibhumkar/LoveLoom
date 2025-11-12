// ----------------------------------------------
// socket.ts — initialize and export socket client
// ----------------------------------------------

import { io, Socket } from 'socket.io-client';
import { HOST } from './axiosInstance';

// same as index.php backend
let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(HOST, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => console.log('✅ Socket connected:', socket?.id));
    socket.on('disconnect', () => console.log('❌ Socket disconnected'));
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error('Socket not initialized. Call connectSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
