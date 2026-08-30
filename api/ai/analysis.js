import { getGemini, ANALYSIS_FALLBACK_INSIGHTS } from '../_ai.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { organizationSummary } = req.body || {};
    const ai = getGemini();

    if (!ai) {
      return res.json({ insights: ANALYSIS_FALLBACK_INSIGHTS });
    }

    const prompt = `จากข้อมูลองค์กรต่อไปนี้:
${JSON.stringify(organizationSummary, null, 2)}

จงวิเคราะห์เชิงลึกและส่งออกผลวิเคราะห์ 4 ด้าน:
1. Emerging Leaders (ผู้นำดาวรุ่ง)
2. Retention Risks (ทีมที่มีความเสี่ยงคนหลุด)
3. Promotion Candidates (ตัวแทนที่มีโอกาสเลื่อนตำแหน่งเร็วๆ นี้)
4. Strategic Coaching Action (ข้อเสนอแนะเชิงปฏิบัติการสำหรับผู้บริหาร)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'คุณคือที่ปรึกษาระดับสูงด้านการบริหารองค์กรตัวแทนประกันชีวิต ตอบเป็นภาษาไทยอย่างเฉียบคมและแม่นยำ',
      },
    });

    return res.json({ analysis: response.text });
  } catch (error) {
    console.error('ai/analysis error:', error);
    return res.status(500).json({ error: error?.message });
  }
}
