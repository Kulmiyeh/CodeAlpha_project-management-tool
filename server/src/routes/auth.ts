import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, me);
router.patch('/me', authRequired, updateProfile);

export default router;
