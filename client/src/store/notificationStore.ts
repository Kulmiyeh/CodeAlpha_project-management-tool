import { create } from 'zustand';
import type { Notification } from '../types';
import * as notificationService from '../services/notificationService';

interface State {
  notifications: Notification[];
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  pushLocal: (n: Notification) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<State>((set, get) => ({
  notifications: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const { notifications } = await notificationService.listNotifications();
      set({ notifications, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  markRead: async (id) => {
    await notificationService.markRead(id);
    set({ notifications: get().notifications.map((n) => (n._id === id ? { ...n, read: true } : n)) });
  },
  markAllRead: async () => {
    await notificationService.markAllRead();
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
  },
  pushLocal: (n) => set({ notifications: [n, ...get().notifications] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
