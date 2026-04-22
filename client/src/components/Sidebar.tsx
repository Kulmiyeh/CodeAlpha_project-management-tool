import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Folder, Mail, UserCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { cn } from '../utils/cn';

export function Sidebar() {
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    );

  return (
    <aside className="hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 md:flex">
      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={linkCls}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={linkCls}>
          <Folder size={16} /> Projects
        </NavLink>
        <NavLink to="/invites" className={linkCls}>
          <Mail size={16} /> Invites
        </NavLink>
        <NavLink to="/profile" className={linkCls}>
          <UserCircle2 size={16} /> Profile
        </NavLink>
      </nav>

      <div className="mt-6">
        <div className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Your projects</div>
        <div className="mt-2 flex max-h-[50vh] flex-col gap-1 overflow-y-auto">
          {projects.slice(0, 12).map((p) => (
            <NavLink
              key={p._id}
              to={`/projects/${p._id}/board`}
              className={({ isActive }) =>
                cn(
                  'truncate rounded-md px-3 py-1.5 text-sm',
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                )
              }
            >
              {p.name}
            </NavLink>
          ))}
          {projects.length === 0 && (
            <div className="px-3 py-1.5 text-xs text-slate-400">No projects yet</div>
          )}
        </div>
      </div>
    </aside>
  );
}
