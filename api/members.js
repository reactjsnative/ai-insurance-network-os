// Members endpoint (Firestore-backed) — replaces the filesystem members.json
// store used by the local Express server, which is read-only on Vercel.
// The app's Firestore collection 'members' (doc id = memberId) is the source of truth.
import { getAdmin } from './_lib.js';

export default async function handler(req, res) {
  const admin = getAdmin();

  if (req.method === 'GET') {
    if (!admin) return res.json({ ok: true, count: 0, members: [] });
    try {
      const snap = await admin.db.collection('members').get();
      const members = snap.docs.map((d) => d.data());
      return res.json({ ok: true, count: members.length, members });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'read failed' });
    }
  }

  if (req.method === 'POST') {
    const row = req.body;
    if (!row || !row.memberId) {
      return res.status(400).json({ ok: false, error: 'invalid member row' });
    }
    if (!admin) {
      return res.status(501).json({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
    }
    try {
      await admin.db.collection('members').doc(String(row.memberId)).set(row, { merge: true });
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'write failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
