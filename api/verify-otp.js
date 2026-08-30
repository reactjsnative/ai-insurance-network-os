import { getAdmin, hashOtp, MAX_ATTEMPTS } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const requestId = String(req.body?.requestId || '').trim();
  const code = String(req.body?.code || '').trim();
  const newPassword = String(req.body?.newPassword || '');

  if (!requestId || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ ok: false, code: 'INVALID_CODE' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ ok: false, code: 'WEAK_PASSWORD' });
  }

  const admin = getAdmin();
  if (!admin) {
    return res.status(501).json({ ok: false, code: 'ADMIN_NOT_CONFIGURED' });
  }

  const ref = admin.db.collection('resetCodes').doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) {
    return res.status(400).json({ ok: false, code: 'INVALID_OR_EXPIRED' });
  }

  const data = snap.data();
  if (data.used) {
    return res.status(400).json({ ok: false, code: 'INVALID_OR_EXPIRED' });
  }
  if (Date.now() > data.expiresAt) {
    return res.status(400).json({ ok: false, code: 'INVALID_OR_EXPIRED' });
  }
  if ((data.attempts || 0) >= MAX_ATTEMPTS) {
    return res.status(429).json({ ok: false, code: 'TOO_MANY_ATTEMPTS' });
  }

  if (hashOtp(code, data.salt) !== data.codeHash) {
    await ref.update({ attempts: (data.attempts || 0) + 1 });
    return res.status(400).json({ ok: false, code: 'INVALID_OR_EXPIRED' });
  }

  try {
    await admin.auth.updateUser(data.uid, { password: newPassword });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      code: 'RESET_FAILED',
      message: (err && err.message) || 'reset failed',
    });
  }

  await ref.update({ used: true });
  return res.json({ ok: true });
}
