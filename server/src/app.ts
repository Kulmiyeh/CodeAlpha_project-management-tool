import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import inviteRoutes from './routes/invites';
import notificationRoutes from './routes/notifications';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/error';

export function createApp(): express.Express {
  const app = express();
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/invites', inviteRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}
