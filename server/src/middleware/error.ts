import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.errors });
    return;
  }
  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
