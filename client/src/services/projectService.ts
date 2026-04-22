import { api } from './api';
import type { Project, Role } from '../types';

export async function listProjects(): Promise<{ projects: Project[] }> {
  const { data } = await api.get('/projects');
  return data;
}

export async function getProject(id: string): Promise<{ project: Project; role: Role }> {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function createProject(payload: { name: string; description?: string }): Promise<{ project: Project }> {
  const { data } = await api.post('/projects', payload);
  return data;
}

export async function updateProject(
  id: string,
  payload: { name?: string; description?: string },
): Promise<{ project: Project }> {
  const { data } = await api.patch(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: 'admin' | 'member',
): Promise<{ project: Project }> {
  const { data } = await api.patch(`/projects/${projectId}/members/${userId}`, { role });
  return data;
}

export async function removeMember(projectId: string, userId: string): Promise<{ project: Project }> {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
  return data;
}
