import { create } from 'zustand';
import type { User } from '../types';
import * as authService from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

function applyToken(token: string | null): void {
  if (token) {
    localStorage.setItem('pm_token', token);
    connectSocket(token);
  } else {
    localStorage.removeItem('pm_token');
    disconnectSocket();
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('pm_token'),
  loading: false,
  initialized: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authService.login(email, password);
      applyToken(token);
      set({ user, token, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err?.response?.data?.error ?? 'Login failed' });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authService.register(name, email, password);
      applyToken(token);
      set({ user, token, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err?.response?.data?.error ?? 'Registration failed' });
      throw err;
    }
  },

  logout: () => {
    applyToken(null);
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const { user } = await authService.getMe();
      applyToken(token);
      set({ user, initialized: true });
    } catch {
      applyToken(null);
      set({ user: null, token: null, initialized: true });
    }
  },

  setUser: (user) => set({ user }),
}));
