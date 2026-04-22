import { FormEvent, useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ProjectCard } from '../components/ProjectCard';
import { Modal } from '../components/Modal';
import { Plus } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function ProjectsPage() {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore();
  const me = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createProject({ name: name.trim(), description });
      setOpen(false);
      setName('');
      setDescription('');
      toast.success('Project created');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Delete this project? This removes all tasks and comments.')) return;
    try {
      await deleteProject(projectId);
      toast.success('Project deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to delete project');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-500">Create and manage your team's projects.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> New project
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        {!loading &&
          projects.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              canDelete={p.owner._id === me?.id}
              onDelete={() => handleDelete(p._id)}
            />
          ))}
        {!loading && projects.length === 0 && (
          <div className="card col-span-full p-8 text-center text-sm text-slate-500">
            No projects yet. Click <strong>New project</strong> to create one.
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New project">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Description (optional)</label>
            <textarea
              className="input min-h-[6rem] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
