// Shared AI helpers for Vercel serverless endpoints (Gemini chat + analysis).
// Mirrors the logic in server.ts so the deployed API behaves identically to local dev.
import { GoogleGenAI } from '@google/genai';

let _ai = null;

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (_ai) return _ai;
  _ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
  return _ai;
}

export const COACH_SYSTEM_INSTRUCTION = `คุณคือ AI Organization Intelligence & Network Coach ประจำแพลตฟอร์ม "AI INSURANCE NETWORK OS" 
สำหรับระบบบริหารองค์กรตัวแทนประกันชีวิตระดับมืออาชีพ
หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับการวิเคราะห์ทีม, ผลงาน (FYC/COM), การคำนวณรายได้ตาม Compensation Plan ฉบับ Update 15 Jan 64
2. ให้คำแนะนำเชิงกลยุทธ์ตามหลักคณิตศาสตร์และการสร้างคน (สร้างคน -> สร้างผู้นำ -> สร้างทีม -> เกิดหน่วย -> เกิดศูนย์ -> เกิดภาค)
3. วิเคราะห์ Retention, Active Rate, At-Risk Teams, และคัดกรองผู้มีศักยภาพเลื่อนตำแหน่ง (Promotion Candidates)
4. ห้ามคาดเดาหรือรับประกันตัวเลขรายได้ ให้ระบุว่าเป็น "Estimated Requirement" หรือ "การคำนวณตามสูตรผลประโยชน์"
5. ใช้ภาษาไทยที่สุภาพ เป็นมืออาชีพ ชัดเจน มีโครงสร้าง และเข้าใจง่าย`;

// Heuristic fallback when GEMINI_API_KEY is not configured — so the coach still answers.
export function fallbackAIAnswer(message, context) {
  const msgLower = String(message || '').toLowerCase();

  if (msgLower.includes('รายได้') || msgLower.includes('income') || msgLower.includes('เงิน')) {
    return `จากการคำนวณตาม Compensation Plan (Update 15 Jan 64):\n- ตำแหน่งผู้บริหารภาค (RM): ได้รับค่าจัดงานภาค T1 (10-18% ของ FYC), ค่าจัดงานภาค T2 (฿1,000-2,500 ต่อศูนย์), ค่าบริหารเป้าหมาย (฿10,000-30,000/เดือน) และโบนัสรายปี (1.5-2.5%)\n- แนะนำตรวจสอบรายละเอียดผ่านแท็บ **Income Calculator** เพื่อดูสูตรคำนวณและสัดส่วนรายได้แบบละเอียดครับ`;
  }

  if (msgLower.includes('เลื่อนตำแหน่ง') || msgLower.includes('เกณฑ์') || msgLower.includes('qualification')) {
    return `เกณฑ์การเลื่อนตำแหน่งในระบบ:\n1. **ผู้บริหารหน่วย (UM)**: บำเหน็จ 20,000 บาท (1-6 เดือน)\n2. **ผู้บริหารศูนย์ (CM)**: บำเหน็จ 75,000 บาท (3-6 เดือน) + แยกหน่วย 2 หน่วย\n3. **ผู้บริหารภาค (RM)**: บำเหน็จ 1,200,000 บาท (12-24 เดือน) + แยกศูนย์ 4 ศูนย์\nคุณสามารถดูความคืบหน้ารายบุคคลได้ที่เมนู **Career Path** ครับ`;
  }

  if (msgLower.includes('เสี่ยง') || msgLower.includes('retention') || msgLower.includes('หลุด')) {
    return `จากการตรวจจับของระบบ:\n- ทีมที่มี Retention ต่ำกว่า 75% มักมีสาเหตุจากการขาดกิจกรรม Activity 2 สัปดาห์แรกของตัวแทนใหม่\n- แนะนำให้ผู้บริหารศูนย์จัดประกบการขาย (Joint Field Work) และใช้ระบบ Goal Planner ติดตามเป้าหมายรายสัปดาห์ครับ`;
  }

  return `ยินดีต้อนรับสู่ AI Network Coach ครับ ระบบสามารถช่วยท่าน:\n1. วิเคราะห์ผลงาน FYC/COM และโครงสร้างองค์กร 4 ระดับ\n2. วางแผนสร้างผู้นำและจำลองการแตกหน่วย/ศูนย์/ภาค (Simulation)\n3. ตรวจสอบเงื่อนไขผลตอบแทนตาม Rule Engine 2021-01-15\nมีส่วนใดที่ต้องการให้ผมวิเคราะห์เพิ่มเติมไหมครับ?`;
}

export const ANALYSIS_FALLBACK_INSIGHTS = [
  { type: 'top_performer', title: 'ศูนย์เชียงใหม่ มี Active Rate สูงสุด (88%)', description: 'มีการสร้างกิจกรรมสม่ำเสมอและ FYC เฉลี่ยต่อตัวแทนสูงกว่าค่าเฉลี่ย 18%' },
  { type: 'retention_risk', title: 'หน่วยหาดใหญ่ พรีเมียร์ พบ Retention ลดลง 12%', description: 'ตัวแทนใหม่ในเดือนที่ 2-3 เริ่มขาดการส่งเบี้ยต่อเนื่อง ควรนัดติวเข้มและประกบงานภาคสนาม' },
  { type: 'promotion_ready', title: 'คุณกนกวรรณ (UM-102) ใกล้ครบเกณฑ์เลื่อนเป็น CM', description: 'FYC สะสมถึง 86% และแยกหน่วยแล้ว 1 หน่วย ขาดอีก 1 หน่วยเพื่อแต่งตั้งผู้บริหารศูนย์' },
  { type: 'strategic_goal', title: 'โอกาสเพิ่มรายได้ภาค 14%', description: 'หากผลักดัน 3 หน่วยที่มี FYC ช่วง 25,000 บาท ให้แตะ 35,000 บาท จะขยับขั้นค่าจัดงานหน่วยเป็น 40%' },
];
