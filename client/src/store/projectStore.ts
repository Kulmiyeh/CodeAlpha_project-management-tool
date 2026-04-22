import { create } from 'zustand';
import type { Project, Role, Task } from '../types';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  currentProject: Project | null;
  currentRole: Role | null;
  tasks: Task[];
  loadingTasks: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (payload: { name: string; description?: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null, role?: Role | null) => void;
  loadProject: (id: string) => Promise<void>;
  loadTasks: (projectId: string) => Promise<void>;
  upsertTaskLocal: (task: Task) => void;
  removeTaskLocal: (taskId: string) => void;
  setTasks: (tasks: Task[]) => void;
  patchCurrentProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  currentProject: null,
  currentRole: null,
  tasks: [],
  loadingTasks: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const { projects } = await projectService.listProjects();
      set({ projects, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createProject: async (payload) => {
    const { project } = await projectService.createProject(payload);
    set({ projects: [project, ...get().projects] });
    return project;
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    set({ projects: get().projects.filter((p) => p._id !== id) });
  },

  setCurrentProject: (project, role = null) =>
    set({ currentProject: project, currentRole: role ?? null }),

  loadProject: async (id) => {
    const { project, role } = await projectService.getProject(id);
    set({ currentProject: project, currentRole: role });
  },

  loadTasks: async (projectId) => {
    set({ loadingTasks: true });
    try {
      const { tasks } = await taskService.listTasks(projectId);
      set({ tasks, loadingTasks: false });
    } catch {
      set({ loadingTasks: false });
    }
  },

  upsertTaskLocal: (task) => {
    const existing = get().tasks;
    const idx = existing.findIndex((t) => t._id === task._id);
    if (idx === -1) {
      set({ tasks: [...existing, task] });
    } else {
      const next = existing.slice();
      next[idx] = task;
      set({ tasks: next });
    }
  },

  removeTaskLocal: (taskId) => {
    set({ tasks: get().tasks.filter((t) => t._id !== taskId) });
  },

  setTasks: (tasks) => set({ tasks }),

  patchCurrentProject: (project) => set({ currentProject: project }),
}));
