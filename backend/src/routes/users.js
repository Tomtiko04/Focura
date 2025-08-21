import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/me/preferences', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ notifications: user.preferences?.notifications || {}, onboarding: user.onboarding || {} });
});

router.patch(
  '/me/preferences',
  authMiddleware,
  [body('notifications').optional().isObject(), body('onboarding').optional().isObject()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { notifications, onboarding } = req.body;
    if (notifications && typeof notifications === 'object') {
      user.preferences = user.preferences || {};
      user.preferences.notifications = notifications;
    }
    if (onboarding && typeof onboarding === 'object') {
      user.onboarding = { ...user.onboarding, ...onboarding };
      if (user.onboarding.completed && !user.onboarding.completedAt) user.onboarding.completedAt = new Date();
    }

    await user.save();
    return res.json({ notifications: user.preferences?.notifications || {}, onboarding: user.onboarding || {} });
  }
);

export default router;
