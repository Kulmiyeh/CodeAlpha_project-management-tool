import { Response, NextFunction } from 'express';
import { Project, ProjectDoc, ProjectRole } from '../models/Project';
import { AuthedRequest } from './auth';
import { forbidden, notFound } from '../utils/ApiError';
import { Types } from 'mongoose';

export interface ProjectRequest extends AuthedRequest {
  project?: ProjectDoc;
  role?: ProjectRole;
}

export function getUserRole(project: ProjectDoc, userId: string): ProjectRole | null {
  if (String(project.owner) === userId) return 'owner';
  const member = project.members.find((m) => String(m.user) === userId);
  return (member?.role as ProjectRole) ?? null;
}

export function requireProjectRole(...allowed: ProjectRole[]) {
  return async (req: ProjectRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId || req.params.id;
      if (!projectId || !Types.ObjectId.isValid(projectId)) throw notFound('Project not found');
      const project = await Project.findById(projectId);
      if (!project) throw notFound('Project not found');
      const role = getUserRole(project, req.userId!);
      if (!role) throw forbidden('Not a project member');
      if (allowed.length && !allowed.includes(role)) throw forbidden('Insufficient permissions');
      req.project = project;
      req.role = role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
