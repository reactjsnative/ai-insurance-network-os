import crypto from 'crypto';
import {
  getAdmin,
  generateOtp,
  hashOtp,
  sendOtpEmail,
  isEmailConfigured,
  OTP_TTL_SECONDS,
} from './_lib.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const RATE_LIMIT_MS = 60 * 1000; // 1 request per email per minute

export default async function handler(req, res) {
  try {
    return await handlerInner(req, res);
  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ ok: false, code: 'INTERNAL', message: (err && err.message) || String(err) });
  }
}

async function handlerInner(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, code: 'INVALID_EMAIL' });
  }

  const admin = getAdmin();
  if (!admin) {
    return res.status(501).json({ ok: false, code: 'ADMIN_NOT_CONFIGURED' });
  }
  if (!isEmailConfigured()) {
    return res.status(503).json({ ok: false, code: 'EMAIL_NOT_CONFIGURED' });
  }

  // Enumeration-safe: resolve the account but never reveal whether it exists.
  let uid = null;
  try {
    const user = await admin.auth.getUserByEmail(email);
    uid = user.uid;
  } catch {
    uid = null;
  }
  if (!uid) {
    // Account not found — pretend success so we don't leak account existence.
    return res.json({ ok: true });
  }

  const now = Date.now();

  // One active OTP per user: deterministic doc id (no composite index required).
  const resetDocId = 'otp_' + uid;
  const resetRef = admin.db.collection('resetCodes').doc(resetDocId);
  const existingSnap = await resetRef.get();
  if (existingSnap.exists) {
    const existing = existingSnap.data();
    const created = existing.createdAt || 0;
    if (!existing.used && now < (existing.expiresAt || 0) && now - created < RATE_LIMIT_MS) {
      return res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        retryAfterSeconds: Math.ceil((RATE_LIMIT_MS - (now - created)) / 1000),
      });
    }
  }

  const code = generateOtp();
  const salt = crypto.randomBytes(16).toString('hex');

  await resetRef.set({
    uid,
    email,
    codeHash: hashOtp(code, salt),
    salt,
    createdAt: now,
    expiresAt: now + OTP_TTL_SECONDS * 1000,
    attempts: 0,
    used: false,
  });

  await sendOtpEmail(email, code);

  return res.json({ ok: true, requestId: resetDocId, expiresInSeconds: OTP_TTL_SECONDS });
}
