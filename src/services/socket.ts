import type { Socket } from 'socket.io-client';
import { tokenStorage } from './api';

let socket: Socket | null = null;
let isConnecting = false;

export function getSocket(): Socket | null {
  try {
    const token = tokenStorage.get();
    if (!token) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return null;
    }

    if (!socket && !isConnecting && typeof window !== 'undefined') {
      isConnecting = true;
      import('socket.io-client')
        .then(({ io }) => {
          if (!socket) {
            socket = io(window.location.origin, {
              auth: { token },
              autoConnect: true,
              transports: ['polling', 'websocket'],
              reconnectionAttempts: 3,
              timeout: 5000
            });

            socket.on('connect_error', (err) => {
              console.warn('Socket connect error:', err.message);
            });
          }
        })
        .catch((err) => {
          console.warn('Socket dynamic import fallback:', err);
        })
        .finally(() => {
          isConnecting = false;
        });
    }

    return socket;
  } catch (err) {
    console.warn('Socket getSocket safe fallback:', err);
    return null;
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
