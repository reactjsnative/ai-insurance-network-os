export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }
  try {
    const { message = '', history = [] } = req.body || {};
    const q = String(message).trim();
    if (!q) return res.status(400).json({error:'message required'});
    // DeepSeek-like proxy: if DEEPSEEK_API_KEY or GEMINI_API_KEY set, try real LLM, else fallback smart
    const tryDeepSeek = async () => {
      const key = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
      if (!key) return null;
      const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
        body: JSON.stringify({
          model:'deepseek-chat',
          messages:[
            {role:'system', content:'คุณคือ AI Network — ผู้ช่วยเครือข่ายประกันชีวิต ตอบภาษาไทย สุภาพ กระชับ เป็นประโยชน์ ตอบได้ทุกเรื่องเหมือน DeepSeek แต่เน้นช่วยงานเครือข่ายตัวแทน ถ้าถามเรื่องรายได้ให้อ้าง Compensation Plan 15 ม.ค.64'},
            ...history.slice(-6).map(m=>({role:m.role, content:m.text||m.content||''})),
            {role:'user', content:q}
          ],
          temperature:0.7, max_tokens:800
        })
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j?.choices?.[0]?.message?.content || null;
    };
    const tryGemini = async () => {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return null;
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: key });
        const resp = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ role:'user', parts:[{text: q}]}],
          config:{ systemInstruction:'คุณคือ AI Network ผู้ช่วยเครือข่ายประกัน ตอบไทย สุภาพ กระชับ ตอบได้ทุกเรื่องเหมือน DeepSeek' }
        });
        return resp?.text || null;
      } catch { return null; }
    };
    let answer = await tryDeepSeek();
    if (!answer) answer = await tryGemini();
    if (!answer) {
      const s = q.toLowerCase();
      if (s.includes('รายได้')||s.includes('income')||s.includes('คอม')) answer = `ตาม Compensation Plan 15 ม.ค.64:\n• UM 25-40% ของ COM\n• CM 3-15% + 0.8% เบี้ยปีต่อ + โบนัส 4-6%\n• RM 10-18% + 1,000-2,500/ศูนย์ + 10k-30k/เดือน + โบนัส 1.5-2.5%\nถาม “คำนวณรายได้” เพื่อให้ผมพาไปเครื่องคิดเลขได้เลยครับ`;
      else if (s.includes('สวัสดี')||s.includes('hello')) answer = `สวัสดีครับ ผม AI Network 🤖 ถามได้ทุกเรื่องเลยนะครับ — ทั้งงานเครือข่ายประกัน, คำนวณรายได้, หาสมาชิก, หรือเรื่องทั่วไปเหมือน DeepSeek ครับ มีอะไรให้ช่วยครับ?`;
      else answer = `รับทราบครับ: “${q.slice(0,120)}”\nผม AI Network พร้อมช่วยตอบทุกเรื่องครับ — ลองถามได้เลย เช่น “อธิบายวิธีปิดการขายประกัน” “สรุปทีมวันนี้” “หา AG000001” หรือ “เขียนอีเมลชวนตัวแทน” ผมตอบได้ทันทีครับ (ถ้าตั้ง DEEPSEEK_API_KEY/GEMINI_API_KEY ใน Vercel จะตอบด้วยโมเดลจริง)`;
    }
    return res.status(200).json({ answer, provider: answer.includes('DeepSeek')||answer.includes('Gemini') ? 'llm' : 'fallback' });
  } catch(e) {
    return res.status(200).json({ answer:'ขออภัยครับ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะครับ', provider:'error' });
  }
}
