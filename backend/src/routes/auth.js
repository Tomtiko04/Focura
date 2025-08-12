import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').optional().isString().trim().isLength({ min: 1 }).withMessage('Name must be a non-empty string'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min length 6')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name = '', email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET || 'dev_secret_change_me', {
      expiresIn: '7d'
    });

    return res.status(201).json({ token, user: user.toSafeJSON() });
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').isString().isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET || 'dev_secret_change_me', {
      expiresIn: '7d'
    });

    return res.json({ token, user: user.toSafeJSON() });
  }
);

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: user.toSafeJSON() });
});

export default router;


