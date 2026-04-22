import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationController';

const router = Router();

router.use(authRequired);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
