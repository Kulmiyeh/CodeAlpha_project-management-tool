import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { unauthorized } from '../utils/ApiError';
import { User, UserDoc } from '../models/User';

export interface AuthedRequest extends Request {
  user?: UserDoc;
  userId?: string;
}

export async function authRequired(req: AuthedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw unauthorized('Missing token');
    const token = header.slice('Bearer '.length);
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);
    if (!user) throw unauthorized('Invalid token');
    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (err) {
    next(err);
  }
}
