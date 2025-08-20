import jwt from 'jsonwebtoken';

const ACCESS_TTL = process.env.ACCESS_TTL_MIN || 15; // minutes
const REFRESH_TTL_DAYS = process.env.REFRESH_TTL_DAYS || 30; // days

export function createAccessToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: `${ACCESS_TTL}m` });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.verify(token, secret);
}

export function refreshExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + Number(REFRESH_TTL_DAYS));
  return d;
}
