import { Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { Invite } from '../models/Invite';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, forbidden, notFound } from '../utils/ApiError';
import { AuthedRequest } from '../middleware/auth';
import { ProjectRequest, getUserRole } from '../middleware/projectAccess';
import { Project } from '../models/Project';
import { emitToProject, emitToUser } from '../sockets/io';

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
});

export const createInvite = asyncHandler(async (req: ProjectRequest, res: Response) => {
  if (req.role !== 'owner' && req.role !== 'admin') throw forbidden('Only owner or admin can invite');
  const body = createSchema.parse(req.body);
  const project = req.project!;

  const existingUser = await User.findOne({ email: body.email.toLowerCase() });
  if (existingUser && getUserRole(project, String(existingUser._id))) {
    throw badRequest('User is already a project member');
  }

  const pending = await Invite.findOne({ project: project._id, email: body.email.toLowerCase(), status: 'pending' });
  if (pending) throw badRequest('There is already a pending invite for this email');

  const token = crypto.randomBytes(24).toString('hex');
  const invite = await Invite.create({
    project: project._id,
    email: body.email.toLowerCase(),
    role: body.role,
    token,
    invitedBy: req.userId,
  });

  if (existingUser) {
    await Notification.create({
      user: existingUser._id,
      type: 'invite_received',
      project: project._id,
      actor: req.userId,
      message: `You were invited to join "${project.name}"`,
    });
    emitToUser(String(existingUser._id), 'notification:new', {
      message: `You were invited to "${project.name}"`,
    });
  }

  res.status(201).json({
    invite: {
      id: String(invite._id),
      email: invite.email,
      role: invite.role,
      status: invite.status,
      token: invite.token,
      project: { id: String(project._id), name: project.name },
    },
  });
});

export const listInvites = asyncHandler(async (req: ProjectRequest, res: Response) => {
  if (req.role !== 'owner' && req.role !== 'admin') throw forbidden();
  const invites = await Invite.find({ project: req.project!._id }).sort({ createdAt: -1 });
  res.json({ invites });
});

export const cancelInvite = asyncHandler(async (req: ProjectRequest, res: Response) => {
  if (req.role !== 'owner' && req.role !== 'admin') throw forbidden();
  const { inviteId } = req.params;
  const invite = await Invite.findOne({ _id: inviteId, project: req.project!._id });
  if (!invite) throw notFound('Invite not found');
  await invite.deleteOne();
  res.json({ success: true });
});

// Authenticated user accepts/rejects an invite they received
export const myPendingInvites = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const invites = await Invite.find({ email: user.email, status: 'pending' })
    .populate('project', 'name description')
    .populate('invitedBy', 'name email avatar')
    .sort({ createdAt: -1 });
  res.json({ invites });
});

export const acceptInvite = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { token } = req.params;
  const invite = await Invite.findOne({ token, status: 'pending' });
  if (!invite) throw notFound('Invite not found or already used');
  const user = req.user!;
  if (user.email.toLowerCase() !== invite.email) throw forbidden('This invite was sent to a different email');
  const project = await Project.findById(invite.project);
  if (!project) {
    invite.status = 'rejected';
    await invite.save();
    throw notFound('Project no longer exists');
  }
  if (!getUserRole(project, String(user._id))) {
    project.members.push({ user: user._id, role: invite.role });
    await project.save();
  }
  invite.status = 'accepted';
  await invite.save();

  await Notification.create({
    user: invite.invitedBy,
    type: 'invite_accepted',
    project: project._id,
    actor: user._id,
    message: `${user.name} accepted your invite to "${project.name}"`,
  });
  emitToUser(String(invite.invitedBy), 'notification:new', { message: `${user.name} accepted your invite` });

  await project.populate('members.user', 'name email avatar');
  emitToProject(String(project._id), 'project:member-added', { project });

  res.json({ project });
});

export const rejectInvite = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { token } = req.params;
  const invite = await Invite.findOne({ token, status: 'pending' });
  if (!invite) throw notFound('Invite not found or already used');
  const user = req.user!;
  if (user.email.toLowerCase() !== invite.email) throw forbidden();
  invite.status = 'rejected';
  await invite.save();
  res.json({ success: true });
});
