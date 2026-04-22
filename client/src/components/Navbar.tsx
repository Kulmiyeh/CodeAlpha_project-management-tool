import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Moon, Sun, UserCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';
import { Avatar } from './Avatar';
import { NotificationPanel } from './NotificationPanel';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const nav = useNavigate();
  const unread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">PM</span>
          <span className="hidden sm:inline">Project Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="btn-ghost !p-2" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="relative">
            <button className="btn-ghost relative !p-2" onClick={() => setPanelOpen((v) => !v)} aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {user ? (
                <Avatar name={user.name} email={user.email} src={user.avatar} size="sm" />
              ) : (
                <UserCircle2 size={24} />
              )}
              <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <UserCircle2 size={16} /> Profile
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    nav('/login');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
