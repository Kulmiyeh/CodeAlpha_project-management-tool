import { api } from './api';
import type { Invite, InviteRole, Project } from '../types';

export async function createInvite(
  projectId: string,
  payload: { email: string; role: InviteRole },
): Promise<{ invite: Invite & { project: { id: string; name: string } } }> {
  const { data } = await api.post(`/projects/${projectId}/invites`, payload);
  return data;
}

export async function listProjectInvites(projectId: string): Promise<{ invites: Invite[] }> {
  const { data } = await api.get(`/projects/${projectId}/invites`);
  return data;
}

export async function cancelInvite(projectId: string, inviteId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/invites/${inviteId}`);
}

export async function myPendingInvites(): Promise<{ invites: Invite[] }> {
  const { data } = await api.get('/invites/pending');
  return data;
}

export async function acceptInvite(token: string): Promise<{ project: Project }> {
  const { data } = await api.post(`/invites/${token}/accept`);
  return data;
}

export async function rejectInvite(token: string): Promise<void> {
  await api.post(`/invites/${token}/reject`);
}
