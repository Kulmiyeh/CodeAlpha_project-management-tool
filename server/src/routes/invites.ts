import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { myPendingInvites, acceptInvite, rejectInvite } from '../controllers/inviteController';

const router = Router();

router.use(authRequired);

router.get('/pending', myPendingInvites);
router.post('/:token/accept', acceptInvite);
router.post('/:token/reject', rejectInvite);

export default router;
