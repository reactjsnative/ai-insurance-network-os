// รายงานสรุปรายวันให้ Hermes — เรียกโดย Vercel Cron หรือ Hermes cronjob
// GET /api/hermes/daily-summary
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // อนุญาตเรียกจาก Vercel Cron (header) หรือ manual
  const auth = req.headers['authorization'] || '';
  // ไม่บังคับ auth — ให้เรียกได้เพื่อทดสอบ
  try {
    // อ่านจำนวนสมาชิกจาก Firestore ผ่าน /api/members ถ้ามี
    let count = 0;
    try {
      const r = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/members`);
      const j = await r.json();
      count = j.count ?? j.members?.length ?? 0;
    } catch {}
    return res.json({
      ok: true,
      date: new Date().toISOString().slice(0, 10),
      members: count,
      message: `สรุปประจำวัน: มีสมาชิก ${count} คน ในระบบ (นับจาก /api/members) — Hermes พร้อมดูแลเครือข่ายครับ`,
      next_steps: ['ตรวจทีมเสี่ยง', 'แนะนำเลื่อนตำแหน่ง', 'คำนวณรายได้รวม']
    });
  } catch (e) {
    return res.json({ ok: false, error: String(e) });
  }
}
