import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { notFound } from '../utils/ApiError';

export const listNotifications = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.userId })
    .populate('actor', 'name email avatar')
    .populate('project', 'name')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ notifications });
});

export const markRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const notif = await Notification.findOneAndUpdate(
    { _id: id, user: req.userId },
    { read: true },
    { new: true },
  );
  if (!notif) throw notFound();
  res.json({ notification: notif });
});

export const markAllRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await Notification.updateMany({ user: req.userId, read: false }, { read: true });
  res.json({ success: true });
});
