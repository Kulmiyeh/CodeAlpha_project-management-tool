import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 p-4 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">PM</span>
          Project Hub
        </div>
        <div className="card p-6 shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
