import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}


