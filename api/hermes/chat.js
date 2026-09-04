// AI Network — Hermes Chat API (minimal, no external import to avoid Vercel build error)
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const message = String(body.message || '').trim();
    const context = body.context || {};
    if (!message) return res.status(400).json({ error: 'message required' });

    const msg = message.toLowerCase();
    let answer = '';
    if (msg.includes('รายได้') || msg.includes('income') || msg.includes('เงิน') || msg.includes('คอม')) {
      answer = `ตาม Compensation Plan 15 ม.ค. 64:\n• UM: ค่าจัดงานหน่วย 25-40% ของ COM (5,000 → 40%)\n• CM: ค่าจัดงานศูนย์ T1 3-15% / T2 0.8% เบี้ยปีต่อ / T3 ตามเกณฑ์ + โบนัสศูนย์ 4-6%\n• RM: ค่าจัดงานภาค T1 10-18% / T2 1,000-2,500/ศูนย์ / เป้าหมาย 10k-30k/เดือน / โบนัส 1.5-2.5%\nดูรายละเอียดที่เมนู “คำนวณรายได้” ได้เลยครับ`;
    } else if (msg.includes('เลื่อนตำแหน่ง') || msg.includes('เกณฑ์') || msg.includes('promotion')) {
      answer = `เกณฑ์เลื่อนตำแหน่ง:\n• ตัวแทน → UM: บำเหน็จ 20,000 (1-6 เดือน)\n• UM → CM: บำเหน็จ 75,000 (3-6 เดือน) + แยก 2 หน่วย\n• CM → RM: บำเหน็จ 1,200,000 (12-24 เดือน) + แยก 4 ศูนย์\nเช็คความคืบหน้าที่ “Career Path” ได้เลยครับ`;
    } else if (msg.includes('สมัคร') || msg.includes('recruit') || msg.includes('ตัวแทนใหม่')) {
      answer = `สมัครตัวแทนใหม่: เมนู “สมัครตัวแทน” → กรอกชื่อ/เบอร์/อีเมล/ผู้แนะนำ (AG code) → ระบบวางสายงานอัตโนมัติ (Balanced) และคำนวณรายได้ทันทีครับ`;
    } else if (msg.includes('สรุปทีม') || msg.includes('ภาพรวม')) {
      const n = context.membersCount ?? 0;
      answer = `ภาพรวมตอนนี้: สมาชิก ${n} คน\n• ดู Tree/Galaxy ที่ “ผังสายงาน”\n• ตรวจทีมเสี่ยงและเลื่อนตำแหน่งที่ “AI Coach” ได้เลยครับ`;
    } else {
      answer = `สวัสดีครับ ผม AI Network — ผู้ช่วยเครือข่ายของคุณ 🤖\nพิมพ์รหัสเช่น AG000001 เพื่อดูโปรไฟล์ทันที หรือพิมพ์ “คำนวณรายได้ / สรุปทีม / สมัครตัวแทน” ได้เลยครับ`;
    }
    if (context && context.membersCount !== undefined) {
      answer += `\n\n[ระบบตอนนี้: สมาชิก ${context.membersCount} คน]`;
    }
    return res.status(200).json({ answer, provider: 'ai-network' });
  } catch (e) {
    return res.status(200).json({ answer: 'ขออภัยครับ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะครับ', provider: 'fallback' });
  }
}
