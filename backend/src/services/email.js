import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = Number(process.env.EMAIL_PORT || 465);
const secure = port === 465; // true for 465, false for other ports
const user = process.env.EMAIL_USERNAME;
const pass = process.env.EMAIL_PASSWORD;

const BACKEND_BASE = process.env.BACKEND_PUBLIC_URL || 'http://localhost:4000';

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

function buttonHtml(href, label) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0"><tr>
      <td style="border-radius:8px;background:#2563eb;padding:12px 18px;">
        <a href="${href}" style="color:#ffffff;text-decoration:none;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${label}</a>
      </td>
    </tr></table>
  `;
}

function containerHtml({ title, emoji = '🎉', lead, ctaHref, ctaLabel, footerHtml }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;">
      <div style="font-size:32px;">${emoji}</div>
      <h1 style="margin:12px 0 8px 0;font-size:20px;color:#111827;">${title}</h1>
      <p style="margin:0 0 20px 0;color:#374151;font-size:14px;line-height:1.5;">${lead}</p>
      ${buttonHtml(ctaHref, ctaLabel)}
      <div style="margin-top:20px;font-size:12px;color:#6b7280;text-align:left;">${footerHtml}</div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:12px;">Focura • Stay on track</p>
  </div>`;
}

export async function sendVerificationEmail(to, token) {
  if (process.env.EMAIL_DISABLE === 'true') {
    return { disabled: true, to, token, type: 'verify' };
  }
  // Primary CTA: backend web fallback endpoint that works today
  const verifyBackend = `${BACKEND_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const { deep, universal, web } = buildLinks('verify', token);

  const html = containerHtml({
    title: 'Verify your email',
    emoji: '✅',
    lead: "You're almost there! Confirm your email to activate your Focura account.",
    ctaHref: verifyBackend,
    ctaLabel: 'Verify my email',
    footerHtml: `
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${verifyBackend}">${verifyBackend}</a><br/><br/>
      Prefer opening the app directly?<br/>
      Deep link: <code>${deep}</code><br/>
      Universal link (when configured): <a href="${universal}">${universal}</a><br/>
      Web (app site): <a href="${web}">${web}</a><br/>
      This link expires in 24 hours.`
  });

  const t = getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || `Focura <${user || 'no-reply@focura.app'}>`,
    to,
    subject: 'Verify your email for Focura',
    text: `Verify your email: ${verifyBackend}\nThis link expires in 24 hours.`,
    html,
  });
  return info;
}

export async function sendPasswordResetEmail(to, token) {
  if (process.env.EMAIL_DISABLE === 'true') {
    return { disabled: true, to, token, type: 'reset' };
  }
  const resetBackend = `${BACKEND_BASE}/api/auth/reset?token=${encodeURIComponent(token)}`; // simple web form
  const { deep, universal, web } = buildLinks('reset-password', token);

  const html = containerHtml({
    title: 'Reset your password',
    emoji: '🔒',
    lead: 'We received a request to reset your password. It expires in 1 hour.',
    ctaHref: resetBackend,
    ctaLabel: 'Reset password',
    footerHtml: `
      If the button doesn't work, copy and paste this link:<br/>
      <a href="${resetBackend}">${resetBackend}</a><br/><br/>
      Open in app (when installed): <code>${deep}</code><br/>
      Universal link (when configured): <a href="${universal}">${universal}</a><br/>
      Web (app site): <a href="${web}">${web}</a>`
  });

  const t = getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || `Focura <${user || 'no-reply@focura.app'}>`,
    to,
    subject: 'Reset your Focura password',
    text: `Reset password: ${resetBackend}\nIf you didn't request this, ignore this email.`,
    html,
  });
  return info;
}
