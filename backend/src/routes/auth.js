import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { createAccessToken, refreshExpiryDate } from '../utils/tokens.js';
import { randomToken, sha256 } from '../utils/crypto.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';

const router = Router();

const limiterAuth = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const limiterSensitive = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

function passwordPolicy(pw) {
  if (!pw || pw.length < 8) return false;
  let score = 0;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score >= 3;
}

// Optional CAPTCHA placeholder middleware
function captchaCheck(req, res, next) { return next(); }

router.post(
  '/register',
  limiterSensitive,
  [
    body('name').optional().isString().trim().isLength({ min: 1 }).withMessage('Name must be a non-empty string'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').custom(passwordPolicy).withMessage('Password must be 8+ chars and include 3 of: lower/upper/number/special')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name = '', email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash, emailVerified: false });

    // Create verification token (24h)
    const verifyRaw = randomToken(32);
    user.verification = { tokenHash: sha256(verifyRaw), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    await user.save();

    await sendVerificationEmail(user.email, verifyRaw);

    return res.status(201).json({ message: 'Registered. Please verify your email to continue.' });
  }
);

router.get('/verify', limiterSensitive, async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing token');
  const hash = sha256(String(token));
  const user = await User.findOne({ 'verification.tokenHash': hash, 'verification.expiresAt': { $gt: new Date() } });
  if (!user) return res.status(400).send('Invalid or expired token');
  user.emailVerified = true;
  user.verification = { tokenHash: undefined, expiresAt: undefined };
  await user.save();
  const redirect = process.env.APP_VERIFY_REDIRECT || 'focura://verified';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <html><body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;">
        <div style="font-size:32px;">✅</div>
        <h1 style="margin:12px 0 8px 0;font-size:20px;color:#111827;">Email verified</h1>
        <p style="color:#374151;">You're all set. You can return to the Focura app.</p>
        <a href="${redirect}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">Open the app</a>
      </div>
    </body></html>
  `);
});

router.post(
  '/login',
  limiterAuth,
  [body('email').isEmail(), body('password').isString().isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.emailVerified) return res.status(403).json({ error: 'Email not verified' });

    const access = createAccessToken({ id: user._id.toString(), email: user.email });

    // rotating refresh token
    const raw = randomToken(48);
    const tokenHash = sha256(raw);
    user.tokens.refresh.push({ tokenHash, createdAt: new Date(), expiresAt: refreshExpiryDate() });
    await user.save();

    return res.json({
      accessToken: access,
      refreshToken: raw,
      user: user.toSafeJSON()
    });
  }
);

router.post('/refresh', limiterAuth, async (req, res) => {
  const raw = String(req.body.refreshToken || '');
  if (!raw) return res.status(400).json({ error: 'Missing refresh token' });
  const hash = sha256(raw);
  const user = await User.findOne({ 'tokens.refresh.tokenHash': hash });
  if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
  const entry = user.tokens.refresh.find((t) => t.tokenHash === hash);
  if (!entry || entry.revokedAt || entry.expiresAt < new Date()) return res.status(401).json({ error: 'Expired or revoked' });

  // rotate
  entry.revokedAt = new Date();
  const newRaw = randomToken(48);
  const newHash = sha256(newRaw);
  entry.replacedBy = newHash;
  user.tokens.refresh.push({ tokenHash: newHash, createdAt: new Date(), expiresAt: refreshExpiryDate() });
  await user.save();

  const access = createAccessToken({ id: user._id.toString(), email: user.email });
  return res.json({ accessToken: access, refreshToken: newRaw });
});

router.post('/logout', limiterAuth, async (req, res) => {
  const raw = String(req.body.refreshToken || '');
  if (!raw) return res.status(200).json({ ok: true });
  const hash = sha256(raw);
  const user = await User.findOne({ 'tokens.refresh.tokenHash': hash });
  if (user) {
    const entry = user.tokens.refresh.find((t) => t.tokenHash === hash);
    if (entry && !entry.revokedAt) entry.revokedAt = new Date();
    await user.save();
  }
  return res.json({ ok: true });
});

router.post(
  '/forgot-password',
  limiterSensitive,
  captchaCheck,
  [body('email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const raw = randomToken(48);
      user.passwordReset = { tokenHash: sha256(raw), expiresAt: new Date(Date.now() + 60 * 60 * 1000) };
      await user.save();
      await sendPasswordResetEmail(email, raw);
    }
    // Always return success to avoid user enumeration
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }
);

// Simple web fallback: reset password form
router.get('/reset', async (req, res) => {
  const { token } = req.query;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`
    <html><body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
        <h1 style="font-size:20px;color:#111827;">Reset your password</h1>
        <form method="POST" action="/api/auth/reset-password" style="display:flex;flex-direction:column;gap:12px;">
          <input type="hidden" name="token" value="${token || ''}"/>
          <label>New password<br/><input name="password" type="password" required minlength="8" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;width:100%"/></label>
          <button type="submit" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 14px;font-weight:600;cursor:pointer;">Set new password</button>
        </form>
      </div>
    </body></html>
  `);
});

router.post(
  '/reset-password',
  limiterSensitive,
  [body('token').isString(), body('password').custom(passwordPolicy)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, password } = req.body;
    const hash = sha256(String(token));
    const user = await User.findOne({ 'passwordReset.tokenHash': hash, 'passwordReset.expiresAt': { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);

    // Invalidate reset token and revoke all refresh tokens
    user.passwordReset = { tokenHash: undefined, expiresAt: undefined };
    user.tokens.refresh = (user.tokens.refresh || []).map((t) => ({ ...t, revokedAt: new Date() }));

    await user.save();
    return res.json({ message: 'Password reset successful. You can now log in.' });
  }
);

router.get('/me', limiterAuth, async (req, res) => {
  // This endpoint ideally verifies access token via middleware; keeping for compatibility
  return res.status(400).json({ error: 'Use /api/auth/protected with access token middleware' });
});

export default router;
