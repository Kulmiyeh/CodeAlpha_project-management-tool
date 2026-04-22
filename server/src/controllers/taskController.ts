import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, forbidden, notFound } from '../utils/ApiError';
import { ProjectRequest, getUserRole } from '../middleware/projectAccess';
import { emitToProject, emitToUser } from '../sockets/io';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(''),
  status: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assignees: z.array(z.string()).optional().default([]),
});

const updateSchema = createSchema.partial().extend({
  order: z.number().optional(),
});

function canModifyTask(role: string): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export const listTasks = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const tasks = await Task.find({ project: req.project!._id })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ status: 1, order: 1, createdAt: 1 });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const body = createSchema.parse(req.body);
  const project = req.project!;
  const statusId = body.status ?? project.columns[0]?.id ?? 'todo';
  if (!project.columns.find((c) => c.id === statusId)) throw badRequest('Invalid status/column');
  // Validate assignees are members
  for (const uid of body.assignees ?? []) {
    if (!getUserRole(project, uid)) throw badRequest('Assignee must be a project member');
  }
  const maxOrder = await Task.findOne({ project: project._id, status: statusId }).sort({ order: -1 }).select('order');
  const task = await Task.create({
    project: project._id,
    title: body.title,
    description: body.description,
    status: statusId,
    priority: body.priority ?? 'medium',
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    assignees: body.assignees ?? [],
    createdBy: req.userId,
    order: (maxOrder?.order ?? -1) + 1,
  });
  await task.populate('assignees', 'name email avatar');
  await task.populate('createdBy', 'name email avatar');

  // Notify assignees
  for (const uid of body.assignees ?? []) {
    if (uid === req.userId) continue;
    await Notification.create({
      user: uid,
      type: 'task_assigned',
      project: project._id,
      task: task._id,
      actor: req.userId,
      message: `You were assigned to "${task.title}"`,
    });
    emitToUser(uid, 'notification:new', { taskId: String(task._id), projectId: String(project._id) });
  }

  emitToProject(String(project._id), 'task:created', { task });
  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { taskId } = req.params;
  if (!Types.ObjectId.isValid(taskId)) throw notFound('Task not found');
  const task = await Task.findOne({ _id: taskId, project: req.project!._id })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar');
  if (!task) throw notFound('Task not found');
  res.json({ task });
});

export const updateTask = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { taskId } = req.params;
  if (!Types.ObjectId.isValid(taskId)) throw notFound('Task not found');
  const role = req.role!;
  if (!canModifyTask(role)) throw forbidden();
  const body = updateSchema.parse(req.body);
  const task = await Task.findOne({ _id: taskId, project: req.project!._id });
  if (!task) throw notFound('Task not found');

  const prevAssignees = new Set(task.assignees.map((a) => String(a)));

  if (body.status && !req.project!.columns.find((c) => c.id === body.status)) {
    throw badRequest('Invalid status/column');
  }
  if (body.assignees) {
    for (const uid of body.assignees) {
      if (!getUserRole(req.project!, uid)) throw badRequest('Assignee must be a project member');
    }
  }

  if (body.title !== undefined) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.status !== undefined) task.status = body.status;
  if (body.priority !== undefined) task.priority = body.priority;
  if (body.dueDate !== undefined) task.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.assignees !== undefined) task.assignees = body.assignees.map((id) => new Types.ObjectId(id));
  if (body.order !== undefined) task.order = body.order;

  await task.save();
  await task.populate('assignees', 'name email avatar');
  await task.populate('createdBy', 'name email avatar');

  // Notify newly added assignees
  if (body.assignees) {
    for (const uid of body.assignees) {
      if (prevAssignees.has(uid) || uid === req.userId) continue;
      await Notification.create({
        user: uid,
        type: 'task_assigned',
        project: req.project!._id,
        task: task._id,
        actor: req.userId,
        message: `You were assigned to "${task.title}"`,
      });
      emitToUser(uid, 'notification:new', { taskId: String(task._id), projectId: String(req.project!._id) });
    }
  }

  emitToProject(String(req.project!._id), 'task:updated', { task });
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { taskId } = req.params;
  if (!Types.ObjectId.isValid(taskId)) throw notFound('Task not found');
  const role = req.role!;
  if (role !== 'owner' && role !== 'admin') throw forbidden('Only owner or admin can delete tasks');
  const task = await Task.findOneAndDelete({ _id: taskId, project: req.project!._id });
  if (!task) throw notFound('Task not found');
  await Comment.deleteMany({ task: task._id });
  emitToProject(String(req.project!._id), 'task:deleted', { taskId: String(task._id) });
  res.json({ success: true });
});

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        taskId: z.string(),
        status: z.string(),
        order: z.number(),
      }),
    )
    .min(1),
});

export const reorderTasks = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const body = reorderSchema.parse(req.body);
  const projectId = req.project!._id;
  await Promise.all(
    body.items.map((item) =>
      Task.updateOne(
        { _id: item.taskId, project: projectId },
        { status: item.status, order: item.order },
      ),
    ),
  );
  const tasks = await Task.find({ project: projectId })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ status: 1, order: 1 });
  emitToProject(String(projectId), 'task:reordered', { tasks });
  res.json({ tasks });
});
