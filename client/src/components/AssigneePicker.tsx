import type { ProjectMember } from '../types';
import { Avatar } from './Avatar';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  members: ProjectMember[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function AssigneePicker({ members, selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((m) => {
        const active = selected.includes(m.user._id);
        return (
          <button
            key={m.user._id}
            type="button"
            onClick={() => toggle(m.user._id)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-2 py-1 text-xs transition',
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300'
                : 'border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
            )}
          >
            <Avatar name={m.user.name} email={m.user.email} src={m.user.avatar} size="xs" />
            <span className="max-w-[8rem] truncate">{m.user.name}</span>
            {active && <Check size={12} />}
          </button>
        );
      })}
    </div>
  );
}
