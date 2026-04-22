import { api } from './api';
import type { Task, Priority } from '../types';

export interface TaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: Priority;
  dueDate?: string | null;
  assignees?: string[];
}

export async function listTasks(projectId: string): Promise<{ tasks: Task[] }> {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return data;
}

export async function createTask(projectId: string, payload: TaskPayload): Promise<{ task: Task }> {
  const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
  return data;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  payload: Partial<TaskPayload> & { order?: number },
): Promise<{ task: Task }> {
  const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}

export async function reorderTasks(
  projectId: string,
  items: { taskId: string; status: string; order: number }[],
): Promise<{ tasks: Task[] }> {
  const { data } = await api.post(`/projects/${projectId}/tasks/reorder`, { items });
  return data;
}
