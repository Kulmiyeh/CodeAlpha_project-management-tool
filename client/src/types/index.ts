export type Role = 'owner' | 'admin' | 'member';
export type Priority = 'low' | 'medium' | 'high';
export type InviteRole = 'admin' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Column {
  id: string;
  title: string;
}

export interface ProjectMember {
  user: PopulatedUser;
  role: Role;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: PopulatedUser;
  members: ProjectMember[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  project: string;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  dueDate: string | null;
  assignees: PopulatedUser[];
  createdBy: PopulatedUser;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  project: string;
  author: PopulatedUser;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  _id: string;
  project: string | { _id: string; name: string; description?: string };
  email: string;
  role: InviteRole;
  token: string;
  status: InviteStatus;
  invitedBy: string | PopulatedUser;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'task_assigned' | 'new_comment' | 'member_joined' | 'invite_accepted' | 'invite_received';
  project?: { _id: string; name: string } | string;
  task?: { _id: string; title: string } | string;
  actor?: PopulatedUser;
  message: string;
  read: boolean;
  createdAt: string;
}
