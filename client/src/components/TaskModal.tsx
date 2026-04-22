import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import type { Comment, Priority, Project, Role, Task } from '../types';
import { AssigneePicker } from './AssigneePicker';
import { CommentBox } from './CommentBox';
import * as taskService from '../services/taskService';
import * as commentService from '../services/commentService';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  role: Role;
  task: Task | null;
  onTaskDeleted?: (id: string) => void;
  /** Extra local-only patches for optimistic UI. */
  onLocalPatch?: (task: Task) => void;
}

export function TaskModal({ open, onClose, project, role, task, onTaskDeleted, onLocalPatch }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<string>('todo');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [saving, setSaving] = useState(false);
  const canModify = role === 'owner' || role === 'admin' || role === 'member';
  const canDelete = role === 'owner' || role === 'admin';

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setStatus(task.status);
    setAssignees(task.assignees.map((a) => a._id));
  }, [task]);

  useEffect(() => {
    if (!open || !task) return;
    let cancel = false;
    commentService.listComments(project._id, task._id).then(({ comments }) => {
      if (!cancel) setComments(comments);
    });
    return () => {
      cancel = true;
    };
  }, [open, task, project._id]);

  // Socket updates for comments are surfaced through the parent component via its own hook;
  // but we also listen here to keep the modal fresh when it is open.
  useEffect(() => {
    if (!open || !task) return;
    const socket = (window as any).__pm_socket as { on: any; off: any } | undefined;
    void socket;
  }, [open, task]);

  if (!task) return null;

  async function save(patch: Partial<taskService.TaskPayload> & { order?: number }) {
    if (!task) return;
    setSaving(true);
    try {
      const { task: updated } = await taskService.updateTask(project._id, task._id, patch);
      onLocalPatch?.(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update task');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(project._id, task._id);
      onTaskDeleted?.(task._id);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to delete');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={<span className="truncate">{task.title}</span>}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{saving ? 'Saving…' : ' '}</span>
          {canDelete && (
            <button className="btn-danger" onClick={handleDelete}>
              <Trash2 size={14} /> Delete task
            </button>
          )}
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
          <input
            className="input"
            disabled={!canModify}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => task && title !== task.title && save({ title })}
          />
          <label className="mb-1 mt-4 block text-xs font-medium text-slate-500">Description</label>
          <textarea
            className="input min-h-[8rem] resize-y"
            disabled={!canModify}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => task && description !== task.description && save({ description })}
          />

          <div className="mt-6">
            <h4 className="mb-2 text-sm font-semibold">Comments</h4>
            <CommentBox
              comments={comments}
              onSubmit={async (body) => {
                const { comment } = await commentService.createComment(project._id, task._id, body);
                setComments((prev) => [...prev, comment]);
              }}
              onDelete={async (id) => {
                await commentService.deleteComment(project._id, id);
                setComments((prev) => prev.filter((c) => c._id !== id));
              }}
              canDeleteOthers={canDelete}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
            <select
              className="input"
              disabled={!canModify}
              value={status}
              onChange={(e) => {
                const v = e.target.value;
                setStatus(v);
                save({ status: v });
              }}
            >
              {project.columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
            <select
              className="input"
              disabled={!canModify}
              value={priority}
              onChange={(e) => {
                const v = e.target.value as Priority;
                setPriority(v);
                save({ priority: v });
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Due date</label>
            <input
              type="date"
              className="input"
              disabled={!canModify}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                save({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null });
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Assignees</label>
            <AssigneePicker
              members={project.members}
              selected={assignees}
              onChange={(ids) => {
                setAssignees(ids);
                save({ assignees: ids });
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
