import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { requireProjectRole } from '../middleware/projectAccess';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  updateMemberRole,
  removeMember,
  addMemberDirect,
} from '../controllers/projectController';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/taskController';
import { listComments, createComment, deleteComment } from '../controllers/commentController';
import { createInvite, listInvites, cancelInvite } from '../controllers/inviteController';

const router = Router();

router.use(authRequired);

router.get('/', listProjects);
router.post('/', createProject);

router.get('/:projectId', requireProjectRole('owner', 'admin', 'member'), getProject);
router.patch('/:projectId', requireProjectRole('owner', 'admin'), updateProject);
router.delete('/:projectId', requireProjectRole('owner'), deleteProject);

// members
router.patch('/:projectId/members/:userId', requireProjectRole('owner'), updateMemberRole);
router.delete('/:projectId/members/:userId', requireProjectRole('owner', 'admin', 'member'), removeMember);
router.post('/:projectId/members', requireProjectRole('owner', 'admin'), addMemberDirect);

// invites
router.get('/:projectId/invites', requireProjectRole('owner', 'admin'), listInvites);
router.post('/:projectId/invites', requireProjectRole('owner', 'admin'), createInvite);
router.delete('/:projectId/invites/:inviteId', requireProjectRole('owner', 'admin'), cancelInvite);

// tasks
router.get('/:projectId/tasks', requireProjectRole('owner', 'admin', 'member'), listTasks);
router.post('/:projectId/tasks', requireProjectRole('owner', 'admin', 'member'), createTask);
router.post('/:projectId/tasks/reorder', requireProjectRole('owner', 'admin', 'member'), reorderTasks);
router.get('/:projectId/tasks/:taskId', requireProjectRole('owner', 'admin', 'member'), getTask);
router.patch('/:projectId/tasks/:taskId', requireProjectRole('owner', 'admin', 'member'), updateTask);
router.delete('/:projectId/tasks/:taskId', requireProjectRole('owner', 'admin'), deleteTask);

// comments
router.get('/:projectId/tasks/:taskId/comments', requireProjectRole('owner', 'admin', 'member'), listComments);
router.post('/:projectId/tasks/:taskId/comments', requireProjectRole('owner', 'admin', 'member'), createComment);
router.delete(
  '/:projectId/comments/:commentId',
  requireProjectRole('owner', 'admin', 'member'),
  deleteComment,
);

export default router;
