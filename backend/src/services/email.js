import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = Number(process.env.EMAIL_PORT || 465);
const secure = port === 465; // true for 465, false for other ports
const user = process.env.EMAIL_USERNAME;
const pass = process.env.EMAIL_PASSWORD;

let transporter;
export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  return transporter;
}

function buildLinks(path, token) {
  const scheme = process.env.APP_SCHEME || 'focura';
  const universalBase = process.env.APP_UNIVERSAL_LINK_BASE || 'https://localhost';
  const webBase = process.env.WEB_BASE_URL || 'http://localhost:3000';
  const deep = `${scheme}://${path}?token=${encodeURIComponent(token)}`;
  const universal = `${universalBase}/${path}?token=${encodeURIComponent(token)}`;
  const web = `${webBase}/${path}?token=${encodeURIComponent(token)}`;
  return { deep, universal, web };
}

export async function sendVerificationEmail(to, token) {
  const { deep, universal, web } = buildLinks('verify', token);
  const t = getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || `Focura <${user || 'no-reply@focura.app'}>`,
    to,
    subject: 'Verify your email for Focura',
    text: `Welcome to Focura!\n\nTap to verify: ${deep}\nIf that doesn't open the app, try: ${universal}\nOr verify on web: ${web}\n\nThis link expires in 24 hours.`,
  });
  return info;
}

export async function sendPasswordResetEmail(to, token) {
  const { deep, universal, web } = buildLinks('reset-password', token);
  const t = getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || `Focura <${user || 'no-reply@focura.app'}>`,
    to,
    subject: 'Reset your Focura password',
    text: `We received a request to reset your password.\n\nReset: ${deep}\nIf that doesn't open the app, try: ${universal}\nOr reset on web: ${web}\n\nThis link expires in 1 hour. If you didn't request this, please ignore.`,
  });
  return info;
}
