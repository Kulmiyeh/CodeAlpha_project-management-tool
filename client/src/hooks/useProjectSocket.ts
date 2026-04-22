import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useProjectStore } from '../store/projectStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Task, Comment, Project } from '../types';

interface Options {
  projectId?: string;
  onComment?: (c: Comment, taskId: string) => void;
  onCommentDelete?: (commentId: string, taskId: string) => void;
}

export function useProjectSocket(opts: Options = {}): void {
  const { projectId, onComment, onCommentDelete } = opts;
  const { upsertTaskLocal, removeTaskLocal, setTasks, patchCurrentProject } = useProjectStore();
  const refetchNotifications = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (projectId) {
      socket.emit('project:join', projectId);
    }

    const handleTaskCreated = (payload: { task: Task }) => upsertTaskLocal(payload.task);
    const handleTaskUpdated = (payload: { task: Task }) => upsertTaskLocal(payload.task);
    const handleTaskDeleted = (payload: { taskId: string }) => removeTaskLocal(payload.taskId);
    const handleTaskReordered = (payload: { tasks: Task[] }) => setTasks(payload.tasks);
    const handleProjectUpdated = (payload: { project: Project }) => patchCurrentProject(payload.project);
    const handleMemberChanged = (payload: { project: Project }) => patchCurrentProject(payload.project);
    const handleCommentCreated = (payload: { comment: Comment; taskId: string }) =>
      onComment?.(payload.comment, payload.taskId);
    const handleCommentDeleted = (payload: { commentId: string; taskId: string }) =>
      onCommentDelete?.(payload.commentId, payload.taskId);
    const handleNotificationNew = () => refetchNotifications();

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:reordered', handleTaskReordered);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('project:member-added', handleMemberChanged);
    socket.on('project:member-updated', handleMemberChanged);
    socket.on('project:member-removed', handleMemberChanged as any);
    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:deleted', handleCommentDeleted);
    socket.on('notification:new', handleNotificationNew);

    return () => {
      if (projectId) socket.emit('project:leave', projectId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:reordered', handleTaskReordered);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('project:member-added', handleMemberChanged);
      socket.off('project:member-updated', handleMemberChanged);
      socket.off('project:member-removed', handleMemberChanged as any);
      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:deleted', handleCommentDeleted);
      socket.off('notification:new', handleNotificationNew);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
}
