import type { Task } from '../types';
import { Avatar } from './Avatar';
import { CalendarDays, Flag, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

interface Props {
  task: Task;
  onClick?: () => void;
  dragging?: boolean;
}

const priorityColor: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
};

export function TaskCard({ task, onClick, dragging }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card cursor-pointer select-none p-3 transition hover:shadow-md',
        dragging && 'rotate-[0.5deg] shadow-lg',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="text-sm font-medium leading-snug">{task.title}</div>
        <span className={cn('chip', priorityColor[task.priority])}>
          <Flag size={10} /> {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} /> {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 3).map((a) => (
            <Avatar key={a._id} name={a.name} email={a.email} src={a.avatar} size="xs" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TaskCardCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <MessageSquare size={12} /> {count}
    </span>
  );
}
