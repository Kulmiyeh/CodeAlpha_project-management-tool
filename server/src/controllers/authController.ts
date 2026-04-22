import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { badRequest, conflict, unauthorized } from '../utils/ApiError';
import { AuthedRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sanitize(user: { _id: unknown; name: string; email: string; avatar: string }) {
  return { id: String(user._id), name: user.name, email: user.email, avatar: user.avatar };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: body.email.toLowerCase() });
  if (existing) throw conflict('Email already registered');
  const user = await User.create(body);
  const token = signToken({ userId: String(user._id) });
  res.status(201).json({ token, user: sanitize(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase() }).select('+password');
  if (!user) throw unauthorized('Invalid credentials');
  const ok = await user.comparePassword(body.password);
  if (!ok) throw unauthorized('Invalid credentials');
  const token = signToken({ userId: String(user._id) });
  res.json({ token, user: sanitize(user) });
});

export const me = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.user) throw unauthorized();
  res.json({ user: sanitize(req.user) });
});

export const updateProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.user) throw unauthorized();
  const schema = z.object({
    name: z.string().min(1).max(80).optional(),
    avatar: z.string().max(500).optional(),
  });
  const body = schema.parse(req.body);
  if (Object.keys(body).length === 0) throw badRequest('Nothing to update');
  Object.assign(req.user, body);
  await req.user.save();
  res.json({ user: sanitize(req.user) });
});
