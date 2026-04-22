import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Link } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { Skeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Folder, Bell, Users } from 'lucide-react';

export function DashboardPage() {
  const { projects, loading, fetchProjects } = useProjectStore();
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationStore((s) => s.notifications);
  const fetchNotifications = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
  }, [fetchProjects, fetchNotifications]);

  const unread = notifications.filter((n) => !n.read).length;
  const memberCount = projects.reduce((sum, p) => sum + p.members.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name.split(' ')[0] || 'there'} 👋</h1>
        <p className="text-sm text-slate-500">Here's a snapshot of your workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800">
            <Folder size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Projects</div>
            <div className="text-2xl font-semibold">{projects.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-slate-800">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Collaborators</div>
            <div className="text-2xl font-semibold">{memberCount}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-slate-800">
            <Bell size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Unread notifications</div>
            <div className="text-2xl font-semibold">{unread}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <Link to="/projects" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
          {!loading && projects.length === 0 && (
            <div className="card col-span-full flex flex-col items-center gap-2 p-10 text-center">
              <Folder size={28} className="text-slate-400" />
              <p className="text-sm text-slate-500">You don't have any projects yet.</p>
              <Link to="/projects" className="btn-primary mt-2">
                Create your first project
              </Link>
            </div>
          )}
          {projects.slice(0, 6).map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
