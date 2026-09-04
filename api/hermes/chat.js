// Hermes AI — standalone fallback (no import to avoid build error)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message, history = [], context = {} } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ error: 'message required' });

    // Fallback intelligent answer — ทำงานได้แม้ไม่มี GEMINI key
    const msg = String(message).toLowerCase();
    let answer = '';
    if (msg.includes('รายได้') || msg.includes('income') || msg.includes('เงิน')) {
      answer = `จากการคำนวณตาม Compensation Plan (Update 15 Jan 64):\n- RM: ค่าจัดงานภาค T1 (10-18% ของ FYC), T2 (฿1,000-2,500/ศูนย์), ค่าบริหารเป้าหมาย (฿10,000-30,000/เดือน) และโบนัสรายปี (1.5-2.5%)\n- ดูรายละเอียดที่แท็บ **คำนวณรายได้** ได้เลยครับ`;
    } else if (msg.includes('เลื่อนตำแหน่ง') || msg.includes('เกณฑ์')) {
      answer = `เกณฑ์เลื่อนตำแหน่ง:\n1. UM: บำเหน็จ 20,000 (1-6 เดือน)\n2. CM: บำเหน็จ 75,000 (3-6 เดือน) + แยกหน่วย 2 หน่วย\n3. RM: บำเหน็จ 1,200,000 (12-24 เดือน) + แยกศูนย์ 4 ศูนย์\nดูความคืบหน้าที่เมนู **Career Path** ครับ`;
    } else if (msg.includes('สมัคร') || msg.includes('recruit')) {
      answer = `วิธีสมัครตัวแทนใหม่: ไปที่เมนู **สมัครตัวแทน** → กรอกชื่อ/เบอร์/อีเมล/ผู้แนะนำ (AG code) → ระบบจะวางสายงานอัตโนมัติ (Balanced/BFS) และคำนวณรายได้ทันทีครับ`;
    } else {
      answer = `สวัสดีครับ ผม Hermes — ผู้ช่วยเครือข่ายของคุณ 🤖\n• พิมพ์รหัสเช่น AG000001 เพื่อดูโปรไฟล์สมาชิกทันที\n• พิมพ์ "คำนวณรายได้" เพื่อไปหน้า Income Calculator\n• พิมพ์ "สรุปทีม" เพื่อดูภาพรวม\nมีอะไรให้ช่วยครับ?`;
    }
    // ถ้ามี context สมาชิกจาก widget ให้เสริม
    if (context && context.membersCount !== undefined) {
      answer += `\n\n[ระบบตอนนี้: สมาชิก ${context.membersCount} คน]`;
    }

    // ลองเรียก Gemini ถ้ามี key (dynamic import ไม่ให้ build พัง)
    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const resp = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            ...history.slice(-6).map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: String(h.text||'').slice(0,1200) }] })),
            { role: 'user', parts: [{ text: `คำถาม: ${message}\nบริบท: ${JSON.stringify(context).slice(0,1500)}` }] }
          ],
          config: { systemInstruction: 'คุณคือ Hermes ผู้ช่วย AI Insurance Network OS สุภาพ ภาษาไทย กระชับ มืออาชีพ', temperature: 0.7, maxOutputTokens: 900 }
        });
        const t = resp?.text || resp?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) answer = t;
      }
    } catch {}

    return res.json({ answer, provider: 'hermes-fallback' });
  } catch (e) {
    return res.status(200).json({ answer: 'ขออภัยครับ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะครับ', provider: 'fallback' });
  }
}
