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
      // Identity consistency: same email = same person. If a member with this
      // email already exists, merge into that record instead of duplicating.
      const email = String(row.email || '').toLowerCase().trim();
      if (email) {
        const snap = await admin.db.collection('members').where('email', '==', email).limit(1).get();
        if (!snap.empty) {
          const existing = snap.docs[0];
          const id = existing.id;
          const merged = { ...existing.data(), ...row, id, memberId: id };
          merged.memberId = id;
          merged.id = id;
          await admin.db.collection('members').doc(id).set(merged, { merge: true });
          return res.json({ ok: true, reused: true, memberId: id });
        }
      }
      await admin.db.collection('members').doc(String(row.memberId)).set(row, { merge: true });
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'write failed' });
    }
  }

  if (req.method === 'DELETE') {
    if (!admin) {
      return res.status(501).json({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
    }
    try {
      const { memberIds, purgeNonRegistered } = req.body || {};
      let deleted = 0;
      if (Array.isArray(memberIds) && memberIds.length) {
        // Delete by explicit id list.
        for (const id of memberIds) {
          await admin.db.collection('members').doc(String(id)).delete();
          deleted++;
        }
        return res.json({ ok: true, deleted });
      }
      if (purgeNonRegistered) {
        // Delete members who never actually registered: placeholder records
        // with no real identity (empty name, email and phone).
        const snap = await admin.db.collection('members').get();
        const toDelete = [];
        snap.docs.forEach((d) => {
          const m = d.data();
          const name = String(m?.name || '').trim();
          const email = String(m?.email || '').trim();
          const phone = String(m?.phone || '').trim();
          if (!name && !email && !phone) toDelete.push(d.id);
        });
        for (const id of toDelete) {
          await admin.db.collection('members').doc(id).delete();
          deleted++;
        }
        return res.json({ ok: true, deleted });
      }
      return res.status(400).json({ ok: false, error: 'memberIds or purgeNonRegistered required' });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'delete failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
