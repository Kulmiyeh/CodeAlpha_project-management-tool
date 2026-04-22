import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { forbidden, notFound } from '../utils/ApiError';
import { ProjectRequest } from '../middleware/projectAccess';
import { emitToProject, emitToUser } from '../sockets/io';

const createSchema = z.object({ body: z.string().min(1).max(5000) });

export const listComments = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { taskId } = req.params;
  if (!Types.ObjectId.isValid(taskId)) throw notFound('Task not found');
  const comments = await Comment.find({ task: taskId, project: req.project!._id })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });
  res.json({ comments });
});

export const createComment = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { taskId } = req.params;
  if (!Types.ObjectId.isValid(taskId)) throw notFound('Task not found');
  const body = createSchema.parse(req.body);
  const task = await Task.findOne({ _id: taskId, project: req.project!._id });
  if (!task) throw notFound('Task not found');
  const comment = await Comment.create({
    task: task._id,
    project: req.project!._id,
    author: req.userId,
    body: body.body,
  });
  await comment.populate('author', 'name email avatar');

  // Notify assignees (except author)
  for (const uid of task.assignees) {
    if (String(uid) === req.userId) continue;
    await Notification.create({
      user: uid,
      type: 'new_comment',
      project: req.project!._id,
      task: task._id,
      actor: req.userId,
      message: `New comment on "${task.title}"`,
    });
    emitToUser(String(uid), 'notification:new', { taskId: String(task._id), projectId: String(req.project!._id) });
  }

  emitToProject(String(req.project!._id), 'comment:created', { comment, taskId: String(task._id) });
  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { commentId } = req.params;
  if (!Types.ObjectId.isValid(commentId)) throw notFound('Comment not found');
  const comment = await Comment.findOne({ _id: commentId, project: req.project!._id });
  if (!comment) throw notFound('Comment not found');
  const isAuthor = String(comment.author) === req.userId;
  const isAdmin = req.role === 'owner' || req.role === 'admin';
  if (!isAuthor && !isAdmin) throw forbidden();
  await comment.deleteOne();
  emitToProject(String(req.project!._id), 'comment:deleted', {
    commentId: String(comment._id),
    taskId: String(comment.task),
  });
  res.json({ success: true });
});
