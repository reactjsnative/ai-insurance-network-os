// Hermes AI — ฝังในระบบ AI Insurance Network OS
// POST /api/hermes/chat { message, history, context }
// ใช้ Gemini ถ้ามี key, ไม่มีก็ fallback ฉลาดๆ + เรียกข้อมูลสมาชิก/รายได้ได้
import { getGemini, fallbackAIAnswer, COACH_SYSTEM_INSTRUCTION } from '../_ai.js';

const HERMES_SYSTEM = `คุณคือ Hermes — ผู้ช่วยอัจฉริยะฝังในระบบ AI Insurance Network OS (โดย Nous Research + DeepSeek/Gemini)
หน้าที่: ช่วยสมาชิกทำงานจริงในระบบนี้

ความสามารถ:
- ค้นหาสมาชิกด้วยรหัส/ชื่อ/เบอร์/สายงาน (ถ้าผู้ใช้ให้รหัส AGxxxx ให้สรุปโปรไฟล์ทันที)
- คำนวณรายได้ตาม Compensation Plan 15 ม.ค. 64 (13 รายการ, 4 ระดับ Agent→UM→CM→RM)
- แนะนำการสร้างทีม, วางสายงาน Auto Sponsor/Balanced/BFS, แยกหน่วย/ศูนย์/ภาค
- สรุปทีม, ตรวจทีมเสี่ยง, แนะนำเลื่อนตำแหน่ง
- พาไปเมนู: ถ้าต้องการให้บอกว่าให้กดเมนูไหน (เช่น ไปที่ คำนวณรายได้ / ผังสายงาน / สมัครตัวแทน)

สไตล์: สุภาพ ภาษาไทย มืออาชีพ กระชับ มีโครงสร้าง ใช้ emoji น้อยๆ, โทนพาสเทลสุภาพ
ห้ามเดาตัวเลขมั่ว — ถ้าไม่มีข้อมูลให้บอกว่าให้ไปดูที่เมนูคำนวณรายได้` + '\n' + COACH_SYSTEM_INSTRUCTION;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message, history = [], context = {} } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ error: 'message required' });

    const ai = getGemini();
    if (!ai) {
      const ans = fallbackAIAnswer(message, context);
      return res.json({ answer: ans, provider: 'fallback' });
    }

    // สร้าง context เสริมจากระบบ (สมาชิกบางส่วน, สถานะ)
    const contextBlock = context && Object.keys(context).length
      ? `\n[ข้อมูลระบบปัจจุบัน]\n${JSON.stringify(context).slice(0, 4000)}\n`
      : '';

    const contents = [
      ...history.slice(-8).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(h.text || '').slice(0, 2000) }]
      })),
      { role: 'user', parts: [{ text: `${contextBlock}\nคำถามผู้ใช้: ${message}` }] }
    ];

    const resp = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: { systemInstruction: HERMES_SYSTEM, temperature: 0.7, maxOutputTokens: 1200 }
    });

    const answer = resp?.text || resp?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackAIAnswer(message, context);
    return res.json({ answer, provider: 'gemini' });
  } catch (e) {
    console.error('[hermes/chat] error', e);
    return res.status(200).json({ answer: fallbackAIAnswer(req.body?.message, {}), provider: 'fallback', error: String(e?.message || e) });
  }
}
