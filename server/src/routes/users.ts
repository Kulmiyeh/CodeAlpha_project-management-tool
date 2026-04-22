import { Router } from 'express';
import { z } from 'zod';
import { authRequired, AuthedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authRequired);

// Lightweight user search (by email prefix / name) for invite autocomplete.
router.get(
  '/search',
  asyncHandler(async (req: AuthedRequest, res) => {
    const schema = z.object({ q: z.string().min(1).max(80) });
    const { q } = schema.parse(req.query);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({ $or: [{ email: regex }, { name: regex }] })
      .select('name email avatar')
      .limit(10);
    res.json({ users });
  }),
);

export default router;
