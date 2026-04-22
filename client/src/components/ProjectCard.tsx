import { Link } from 'react-router-dom';
import { Folder, Trash2, Users } from 'lucide-react';
import type { Project } from '../types';
import { Avatar } from './Avatar';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  project: Project;
  onDelete?: (project: Project) => void;
  canDelete?: boolean;
}

export function ProjectCard({ project, onDelete, canDelete }: Props) {
  return (
    <div className="card flex flex-col gap-4 p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <Link to={`/projects/${project._id}/board`} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800">
            <Folder size={20} />
          </div>
          <div>
            <div className="font-semibold">{project.name}</div>
            <div className="text-xs text-slate-500">
              Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </Link>
        {canDelete && onDelete && (
          <button
            className="btn-ghost !p-1 text-slate-400 hover:text-red-600"
            onClick={() => onDelete(project)}
            aria-label="Delete project"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {project.description && (
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex -space-x-2">
          {project.members.slice(0, 5).map((m) => (
            <Avatar key={m.user._id} name={m.user.name} email={m.user.email} src={m.user.avatar} size="xs" />
          ))}
          {project.members.length > 5 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-medium text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-900">
              +{project.members.length - 5}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1">
          <Users size={14} /> {project.members.length}
        </span>
      </div>
    </div>
  );
}
