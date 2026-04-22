import { Response } from 'express';
import { z } from 'zod';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Invite } from '../models/Invite';
import { User } from '../models/User';
import { AuthedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, forbidden, notFound } from '../utils/ApiError';
import { ProjectRequest, getUserRole } from '../middleware/projectAccess';
import { emitToProject, emitToUser } from '../sockets/io';
import { Notification } from '../models/Notification';

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(''),
});

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
});

export const listProjects = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = req.userId!;
  const projects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });
  res.json({ projects });
});

export const createProject = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = createSchema.parse(req.body);
  const project = await Project.create({
    ...body,
    owner: req.userId,
    members: [{ user: req.userId, role: 'owner' }],
  });
  await project.populate('owner', 'name email avatar');
  await project.populate('members.user', 'name email avatar');
  res.status(201).json({ project });
});

export const getProject = asyncHandler(async (req: ProjectRequest, res: Response) => {
  await req.project!.populate('owner', 'name email avatar');
  await req.project!.populate('members.user', 'name email avatar');
  res.json({ project: req.project, role: req.role });
});

export const updateProject = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const body = updateSchema.parse(req.body);
  Object.assign(req.project!, body);
  await req.project!.save();
  await req.project!.populate('owner', 'name email avatar');
  await req.project!.populate('members.user', 'name email avatar');
  emitToProject(String(req.project!._id), 'project:updated', { project: req.project });
  res.json({ project: req.project });
});

export const deleteProject = asyncHandler(async (req: ProjectRequest, res: Response) => {
  if (req.role !== 'owner') throw forbidden('Only the owner can delete this project');
  const projectId = req.project!._id;
  await Promise.all([
    Task.deleteMany({ project: projectId }),
    Comment.deleteMany({ project: projectId }),
    Invite.deleteMany({ project: projectId }),
    Project.deleteOne({ _id: projectId }),
  ]);
  emitToProject(String(projectId), 'project:deleted', { projectId: String(projectId) });
  res.json({ success: true });
});

const memberRoleSchema = z.object({ role: z.enum(['admin', 'member']) });

export const updateMemberRole = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { role } = memberRoleSchema.parse(req.body);
  const { userId } = req.params;
  const project = req.project!;
  if (String(project.owner) === userId) throw badRequest('Cannot change the owner role');
  const member = project.members.find((m) => String(m.user) === userId);
  if (!member) throw notFound('Member not found');
  member.role = role;
  await project.save();
  await project.populate('members.user', 'name email avatar');
  emitToProject(String(project._id), 'project:member-updated', { project });
  res.json({ project });
});

export const removeMember = asyncHandler(async (req: ProjectRequest, res: Response) => {
  const { userId } = req.params;
  const project = req.project!;
  if (String(project.owner) === userId) throw badRequest('Cannot remove the owner');
  const targetRole = getUserRole(project, userId);
  if (!targetRole) throw notFound('Member not found');
  // Members can remove themselves; admins can remove members; owner can remove anyone.
  const actorRole = req.role!;
  const isSelf = String(req.userId) === userId;
  if (!isSelf) {
    if (actorRole === 'member') throw forbidden('Insufficient permissions');
    if (actorRole === 'admin' && targetRole === 'admin') throw forbidden('Admins cannot remove other admins');
  }
  project.members.splice(
    0,
    project.members.length,
    ...project.members.filter((m) => String(m.user) !== userId),
  );
  await project.save();
  await project.populate('members.user', 'name email avatar');
  emitToProject(String(project._id), 'project:member-removed', { projectId: String(project._id), userId });
  emitToUser(userId, 'project:left', { projectId: String(project._id) });
  res.json({ project });
});

export const addMemberDirect = asyncHandler(async (req: ProjectRequest, res: Response) => {
  // Used mostly for testing / admin add; normally invites are used.
  if (req.role !== 'owner' && req.role !== 'admin') throw forbidden();
  const schema = z.object({ email: z.string().email(), role: z.enum(['admin', 'member']).default('member') });
  const body = schema.parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase() });
  if (!user) throw notFound('User not found');
  const project = req.project!;
  if (getUserRole(project, String(user._id))) throw badRequest('User is already a member');
  project.members.push({ user: user._id, role: body.role });
  await project.save();
  await project.populate('members.user', 'name email avatar');
  await Notification.create({
    user: user._id,
    type: 'member_joined',
    project: project._id,
    actor: req.userId,
    message: `You were added to project "${project.name}"`,
  });
  emitToProject(String(project._id), 'project:member-added', { project });
  emitToUser(String(user._id), 'notification:new', { message: `You were added to "${project.name}"` });
  res.json({ project });
});
