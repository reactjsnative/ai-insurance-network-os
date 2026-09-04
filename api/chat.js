export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const q = String(req.body?.message || '').trim();
  if (!q) return res.status(400).json({error:'required'});
  // minimal DeepSeek proxy - no imports to avoid build error
  const key = process.env.DEEPSEEK_API_KEY;
  if (key) {
    try {
      const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
        body: JSON.stringify({
          model:'deepseek-chat',
          messages:[
            {role:'system', content:'คุณคือ AI Network ผู้ช่วยเครือข่ายประกัน ตอบภาษาไทย สุภาพ กระชับ ตอบได้ทุกเรื่องเหมือน DeepSeek'},
            {role:'user', content:q}
          ],
          temperature:0.7, max_tokens:600
        })
      });
      const j = await r.json();
      const ans = j?.choices?.[0]?.message?.content;
      if (ans) return res.status(200).json({answer: ans});
    } catch {}
  }
  return res.status(200).json({answer: 'สวัสดีครับ ผม AI Network (DeepSeek) พร้อมช่วยครับ — คุณถามว่า “'+q.slice(0,80)+'” ผมตอบได้ทุกเรื่องเลยนะครับ ลองถามต่อได้เลยครับ'});
}
