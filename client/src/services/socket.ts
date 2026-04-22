import { io, Socket } from 'socket.io-client';
import { API_ORIGIN } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket && socket.connected) return socket;
  socket?.disconnect();
  socket = io(API_ORIGIN, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
