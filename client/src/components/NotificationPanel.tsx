import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: Props) {
  const { notifications, fetch, markRead, markAllRead, loading } = useNotificationStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <div className="text-sm font-semibold">Notifications</div>
        <button
          className="btn-ghost !px-2 !py-1 !text-xs"
          onClick={async () => {
            await markAllRead();
          }}
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading && <div className="p-4 text-center text-sm text-slate-400">Loading…</div>}
        {!loading && notifications.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-400">You're all caught up.</div>
        )}
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800 ${
              n.read ? 'opacity-60' : ''
            }`}
          >
            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-brand-500'}`} />
            <div className="min-w-0 flex-1">
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </div>
            </div>
            {!n.read && (
              <button className="btn-ghost !p-1" onClick={() => markRead(n._id)} aria-label="Mark read">
                <Check size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="sr-only" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
