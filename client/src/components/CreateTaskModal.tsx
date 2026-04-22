import { FormEvent, useEffect, useState } from 'react';
import { Modal } from './Modal';
import type { Priority, Project } from '../types';
import { AssigneePicker } from './AssigneePicker';
import * as taskService from '../services/taskService';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  defaultStatus?: string;
  onCreated?: () => void;
}

export function CreateTaskModal({ open, onClose, project, defaultStatus, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [status, setStatus] = useState(defaultStatus || project.columns[0]?.id || 'todo');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus || project.columns[0]?.id || 'todo');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssignees([]);
    }
  }, [open, defaultStatus, project.columns]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await taskService.createTask(project._id, {
        title: title.trim(),
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignees,
      });
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New task" size="md">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
          <input className="input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
          <textarea
            className="input min-h-[6rem] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {project.columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Due date</label>
            <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Assignees</label>
          <AssigneePicker members={project.members} selected={assignees} onChange={setAssignees} />
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || !title.trim()}>
            {submitting ? 'Creating…' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
