import { api } from './api';
import type { Comment } from '../types';

export async function listComments(projectId: string, taskId: string): Promise<{ comments: Comment[] }> {
  const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}/comments`);
  return data;
}

export async function createComment(
  projectId: string,
  taskId: string,
  body: string,
): Promise<{ comment: Comment }> {
  const { data } = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { body });
  return data;
}

export async function deleteComment(projectId: string, commentId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/comments/${commentId}`);
}
