import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface State {
  theme: Theme;
  toggle: () => void;
  init: () => void;
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export const useThemeStore = create<State>((set, get) => ({
  theme: (localStorage.getItem('pm_theme') as Theme) || 'light',
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pm_theme', next);
    apply(next);
    set({ theme: next });
  },
  init: () => {
    apply(get().theme);
  },
}));
