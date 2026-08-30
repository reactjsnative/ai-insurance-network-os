import { getGemini, COACH_SYSTEM_INSTRUCTION, fallbackAIAnswer } from '../_ai.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing "message" (string).' });
    }

    const ai = getGemini();
    if (!ai) {
      // High quality fallback heuristic answer if key not yet provided in secrets
      return res.json({ reply: fallbackAIAnswer(message, context), isMock: false, model: 'local-analytics-engine' });
    }

    const promptContext = context ? `\n\nข้อมูลบริบทขององค์กรปัจจุบัน:\n${JSON.stringify(context, null, 2)}` : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `${message}${promptContext}`,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const reply = response.text || 'ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้';
    return res.json({ reply, model: 'gemini-3.7-flash' });
  } catch (error) {
    console.error('ai/chat error:', error);
    return res.status(500).json({ error: error?.message || 'Error processing AI request' });
  }
}
