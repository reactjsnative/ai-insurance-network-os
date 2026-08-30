// Shared helpers for the Vercel serverless OTP endpoints.
// Kept in a single place so request-otp and verify-otp share one Admin SDK instance.
import crypto from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const OTP_TTL_SECONDS = 600; // 10 minutes
export const MAX_ATTEMPTS = 5;

// Firestore database id. Defaults to the project's "(default)" database.
// Override via env if the project uses a named database.
const FIREBASE_DB_ID = process.env.FIREBASE_DATABASE_ID || '(default)';

let _admin = null;

/**
 * Lazily initialize the Firebase Admin SDK from FIREBASE_SERVICE_ACCOUNT_JSON.
 * Returns null when the service account is not configured (feature disabled).
 */
export function getAdmin() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return null;
  if (_admin) return _admin;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const opts = { credential: cert(serviceAccount) };
  if (process.env.FIREBASE_DATABASE_ID) opts.databaseId = process.env.FIREBASE_DATABASE_ID;
  const app = getApps().length ? getApps()[0] : initializeApp(opts);
  _admin = { auth: getAuth(app), db: getFirestore(app) };
  return _admin;
}

export function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

export function hashOtp(code, salt) {
  return crypto.createHash('sha256').update(`${code}:${salt}`).digest('hex');
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendOtpEmail(toEmail, code) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('EMAIL_NOT_CONFIGURED');
  const from =
    process.env.RESEND_FROM_EMAIL || 'AI Insurance Network OS <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: 'รหัส OTP รีเซ็ตรหัสผ่าน — AI Insurance Network OS',
      html: `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1e293b">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6366f1">AI Insurance Network OS</div>
          <h2 style="margin:16px 0 4px;font-size:20px">รีเซ็ตรหัสผ่านของคุณ</h2>
          <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6">กรุณาใช้รหัสยืนยัน (OTP) ด้านล่างเพื่อตั้งรหัสผ่านใหม่ รหัสนี้ใช้ได้ครั้งเดียวและหมดอายุใน 10 นาที</p>
          <div style="text-align:center;padding:20px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px">
            <div style="font-size:11px;color:#6366f1;font-weight:700;letter-spacing:.1em">รหัสยืนยัน OTP</div>
            <div style="font-size:36px;font-weight:800;letter-spacing:.35em;color:#4f46e5;margin-top:6px">${code}</div>
          </div>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:12px">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้ได้</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error('EMAIL_SEND_FAILED: ' + body.slice(0, 200));
  }
}
