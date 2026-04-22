import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth?.token as string | undefined) ?? '';
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      (socket.data as { userId: string }).userId = payload.userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket.data as { userId: string }).userId;
    socket.join(`user:${userId}`);

    socket.on('project:join', (projectId: string) => {
      if (typeof projectId === 'string' && projectId) socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', (projectId: string) => {
      if (typeof projectId === 'string' && projectId) socket.leave(`project:${projectId}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitToProject(projectId: string, event: string, payload: unknown): void {
  getIO().to(`project:${projectId}`).emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  getIO().to(`user:${userId}`).emit(event, payload);
}
