import { getAdmin } from './_lib.js';

export default async function handler(_req, res) {
  try {
    const admin = getAdmin();
    let members = 0;
    if (admin) {
      const snap = await admin.db.collection('members').get();
      members = snap.size;
    }
    return res.json({
      ok: true,
      members,
      // Visitor tracking is filesystem-based and only runs on the local Express server.
      visitors: 0,
      deployUrl: process.env.DEPLOY_URL || '',
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
