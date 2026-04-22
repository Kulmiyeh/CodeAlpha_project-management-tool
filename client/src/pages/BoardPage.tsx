import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useProjectStore } from '../store/projectStore';
import { BoardColumn } from '../components/BoardColumn';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { TaskModal } from '../components/TaskModal';
import { Modal } from '../components/Modal';
import { MembersPanel } from '../components/MembersPanel';
import { useProjectSocket } from '../hooks/useProjectSocket';
import { Skeleton } from '../components/Skeleton';
import type { Task } from '../types';
import * as taskService from '../services/taskService';
import { Settings, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    currentProject,
    currentRole,
    tasks,
    loadingTasks,
    loadProject,
    loadTasks,
    setTasks,
    patchCurrentProject,
  } = useProjectStore();
  const [creating, setCreating] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProject(id).catch(() => toast.error('Failed to load project'));
    loadTasks(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useProjectSocket({ projectId: id });

  const tasksByCol = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of currentProject?.columns ?? []) map[col.id] = [];
    for (const t of tasks) {
      if (!map[t.status]) map[t.status] = [];
      map[t.status].push(t);
    }
    for (const k of Object.keys(map)) map[k].sort((a, b) => a.order - b.order);
    return map;
  }, [tasks, currentProject?.columns]);

  async function handleDragEnd(result: DropResult) {
    if (!currentProject) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = tasksByCol[source.droppableId] ?? [];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : tasksByCol[destination.droppableId] ?? [];
    const moving = tasks.find((t) => t._id === draggableId);
    if (!moving) return;

    // Build new arrays
    const newSource = sourceCol.filter((t) => t._id !== draggableId);
    const newDest = source.droppableId === destination.droppableId ? newSource : destCol.slice();
    newDest.splice(destination.index, 0, { ...moving, status: destination.droppableId });

    // Compute new orders
    const updatedItems: { taskId: string; status: string; order: number }[] = [];
    newDest.forEach((t, idx) => updatedItems.push({ taskId: t._id, status: destination.droppableId, order: idx }));
    if (source.droppableId !== destination.droppableId) {
      newSource.forEach((t, idx) => updatedItems.push({ taskId: t._id, status: source.droppableId, order: idx }));
    }

    // Optimistic local update
    const next = tasks.map((t) => {
      const match = updatedItems.find((u) => u.taskId === t._id);
      if (!match) return t;
      return { ...t, status: match.status, order: match.order };
    });
    setTasks(next);

    try {
      await taskService.reorderTasks(currentProject._id, updatedItems);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to reorder');
      // Refresh from server to rollback
      await loadTasks(currentProject._id);
    }
  }

  if (!currentProject) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-96 w-72" />
          <Skeleton className="h-96 w-72" />
          <Skeleton className="h-96 w-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{currentProject.name}</h1>
          {currentProject.description && (
            <p className="mt-1 text-sm text-slate-500">{currentProject.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => setMembersOpen(true)}>
            <Users size={14} /> Members ({currentProject.members.length})
          </button>
          {currentRole === 'owner' && (
            <button className="btn-ghost" onClick={() => setMembersOpen(true)}>
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>

      {loadingTasks && !tasks.length ? (
        <div className="flex gap-4">
          <Skeleton className="h-96 w-72" />
          <Skeleton className="h-96 w-72" />
          <Skeleton className="h-96 w-72" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {currentProject.columns.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={tasksByCol[col.id] ?? []}
                onAddTask={() => setCreating(col.id)}
                onOpenTask={(t) => setEditing(t)}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {creating && (
        <CreateTaskModal
          open={!!creating}
          onClose={() => setCreating(null)}
          project={currentProject}
          defaultStatus={creating}
        />
      )}

      {editing && currentRole && (
        <TaskModal
          open={!!editing}
          onClose={() => setEditing(null)}
          project={currentProject}
          role={currentRole}
          task={editing}
          onLocalPatch={(t) => setEditing(t)}
        />
      )}

      <Modal open={membersOpen} onClose={() => setMembersOpen(false)} title="Members & invites" size="lg">
        {currentRole && (
          <MembersPanel project={currentProject} role={currentRole} onProjectChange={patchCurrentProject} />
        )}
      </Modal>
    </div>
  );
}
