import { notifyStats } from './_notify.js';
import { getAdmin } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const admin = getAdmin();
    let members = 0;
    if (admin) {
      const snap = await admin.db.collection('members').get();
      members = snap.size;
    }
    await notifyStats(0, members);
    return res.json({ ok: true, visitors: 0, members });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
